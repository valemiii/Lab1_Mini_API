const { OrderStatus } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// ADMIN SERVICE: consultas y acciones que solo hace el administrador

const toInt = (value, def, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return max ? Math.min(n, max) : n;
};

const parseStatus = (status) => {
  if (status === undefined) return undefined;
  if (!Object.values(OrderStatus).includes(status))
    throw new HttpError(400, `status debe ser uno de: ${Object.values(OrderStatus).join(", ")}`);
  return status;
};

// Filtros + paginación + orden + conteo en una sola transacción de lectura
const listOrders = async ({ status, from, to, page, limit }) => {
  const p = toInt(page, 1); const take = toInt(limit, 10, 50); const parsed = parseStatus(status);
  const where = { ...(parsed ? { status: parsed } : {}), ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) };
  const [total, data] = await prisma.$transaction([prisma.order.count({ where }), prisma.order.findMany({ where, include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" }, skip: (p - 1) * take, take })]);
  return { page: p, limit: take, total, pages: Math.ceil(total / take), data };
};

const updateOrderStatus = async (id, status) => {
  if (status === undefined) throw new HttpError(400, "Envía el nuevo status");
  return prisma.order.update({ where: { id }, data: { status: parseStatus(status) } }); // no existe → P2025 → 404
};

// Consulta avanzada: agrupa los ítems por producto y suma unidades vendidas
const topProducts = async (limit) => {
  const take = toInt(limit, 5, 50); const rows = await prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, where: { order: { status: { not: "CANCELLED" } } }, orderBy: { _sum: { quantity: "desc" } }, take });
  const products = await prisma.product.findMany({ where: { id: { in: rows.map((r) => r.productId) } }, select: { id: true, name: true } });
  return rows.map((r) => ({ productId: r.productId, name: products.find((p) => p.id === r.productId)?.name, unitsSold: r._sum.quantity }));
};

module.exports = { listOrders, updateOrderStatus, topProducts };
