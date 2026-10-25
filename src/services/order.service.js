const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const orderInclude = { items: { include: { product: { select: { id: true, name: true, sku: true } } } } };
const customerOf = async (userId) => {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) throw new HttpError(403, "El usuario no tiene perfil de cliente");
  return customer;
};
const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "items debe ser un arreglo con al menos un producto");
  for (const [i, item] of items.entries()) {
    if (!item || !Number.isInteger(item.productId) || item.productId < 1 || !Number.isInteger(item.quantity) || item.quantity < 1) throw new HttpError(400, `Ítem ${i + 1}: productId y quantity deben ser enteros positivos`);
  }
  if (new Set(items.map((item) => item.productId)).size !== items.length) throw new HttpError(400, "No repitas el mismo producto: suma las cantidades");
};
const create = async (userId, items) => {
  validateItems(items);
  const customer = await customerOf(userId);
  return prisma.$transaction(async (tx) => {
    const lines = [];
    let total = new Prisma.Decimal(0);
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, price: true } });
      if (!product) throw new HttpError(404, `Producto ${item.productId} no encontrado`);
      const changed = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (changed.count !== 1) throw new HttpError(409, `Stock insuficiente para el producto ${item.productId}`);
      const unitPrice = new Prisma.Decimal(product.price);
      total = total.add(unitPrice.mul(item.quantity));
      lines.push({ productId: item.productId, quantity: item.quantity, unitPrice });
    }
    return tx.order.create({ data: { customerId: customer.id, total, items: { create: lines } }, include: orderInclude });
  });
};
const listByUser = async (userId) => {
  const customer = await customerOf(userId);
  return prisma.order.findMany({ where: { customerId: customer.id }, include: orderInclude, orderBy: { createdAt: "desc" } });
};
const cancel = async (userId, orderId) => prisma.$transaction(async (tx) => {
  const customer = await tx.customer.findUnique({ where: { userId } });
  if (!customer) throw new HttpError(403, "El usuario no tiene perfil de cliente");
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new HttpError(404, "Pedido no encontrado");
  if (order.customerId !== customer.id) throw new HttpError(403, "No puedes cancelar un pedido de otro usuario");
  if (order.status !== "PENDING") throw new HttpError(409, "Solo se pueden cancelar pedidos pendientes");
  const changed = await tx.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
  if (changed.count !== 1) throw new HttpError(409, "El pedido ya fue procesado");
  for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
  return tx.order.findUnique({ where: { id: orderId }, include: orderInclude });
});
module.exports = { create, listByUser, cancel };
