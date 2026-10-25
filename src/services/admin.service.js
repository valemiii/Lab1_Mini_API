const { OrderStatus } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const includeOrder = {
  customer: { select: { id: true, fullName: true, email: true } },
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
};
const parseStatus = (status) => {
  if (status === undefined || status === "") return undefined;
  if (!Object.values(OrderStatus).includes(status)) throw new HttpError(400, `status debe ser uno de: ${Object.values(OrderStatus).join(", ")}`);
  return status;
};
const parseDate = (value, field, endOfDay = false) => {
  if (value === undefined || value === "") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new HttpError(400, `${field} debe ser una fecha válida`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) && endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};
const parsePositive = (value, fallback, max) => {
  if (value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new HttpError(400, "page y limit deben ser enteros positivos");
  return max ? Math.min(number, max) : number;
};
const listOrders = async ({ status, from, to, page, limit }) => {
  const start = parseDate(from, "from");
  const end = parseDate(to, "to", true);
  if (start && end && start > end) throw new HttpError(400, "from no puede ser posterior a to");
  const currentPage = parsePositive(page, 1);
  const pageSize = parsePositive(limit, 10, 50);
  const selectedStatus = parseStatus(status);
  const where = {
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(start || end ? { createdAt: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } } : {}),
  };
  const [total, data] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, include: includeOrder, orderBy: { createdAt: "desc" }, skip: (currentPage - 1) * pageSize, take: pageSize }),
  ]);
  return { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize), data };
};
const updateOrderStatus = async (id, status) => {
  const parsed = parseStatus(status);
  if (parsed !== "DELIVERED") throw new HttpError(400, "Solo se puede marcar como DELIVERED un pedido pendiente; usa /cancel para cancelar y devolver el stock");
  const changed = await prisma.order.updateMany({ where: { id, status: "PENDING" }, data: { status: "DELIVERED" } });
  if (changed.count === 0) {
    const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!order) throw new HttpError(404, "Pedido no encontrado");
    throw new HttpError(409, "Solo se puede entregar un pedido pendiente");
  }
  return prisma.order.findUnique({ where: { id }, include: includeOrder });
};
const topProducts = async (limit) => {
  const take = parsePositive(limit, 5, 20);
  const groups = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { is: { status: { not: "CANCELLED" } } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take,
  });
  if (!groups.length) return [];
  const products = await prisma.product.findMany({ where: { id: { in: groups.map((group) => group.productId) } }, select: { id: true, name: true, sku: true } });
  const byId = new Map(products.map((product) => [product.id, product]));
  return groups.map((group) => ({ productId: group.productId, name: byId.get(group.productId)?.name, sku: byId.get(group.productId)?.sku, unitsSold: group._sum.quantity ?? 0 }));
};
module.exports = { listOrders, updateOrderStatus, topProducts };
