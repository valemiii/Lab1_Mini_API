const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de pedidos: el recurso limitado es el stock (en citas médicas sería el bloque de tiempo)

// Cómo se devuelve un pedido: con sus ítems y el nombre del producto (fetch explícito)
const orderInclude = {
  items: { include: { product: { select: { id: true, name: true } } } },
};

const customerOf = async (userId) => {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) throw new HttpError(403, "El usuario no tiene perfil de cliente");
  return customer;
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0)
    throw new HttpError(400, "items debe ser un arreglo con al menos un producto");
  for (const [i, it] of items.entries()) {
    if (!Number.isInteger(it.productId) || !Number.isInteger(it.quantity) || it.quantity < 1)
      throw new HttpError(400, `Ítem ${i + 1}: productId y quantity deben ser enteros y quantity >= 1`);
  }
  if (new Set(items.map((it) => it.productId)).size !== items.length)
    throw new HttpError(400, "No repitas el mismo producto: suma las cantidades");
};

// TRANSACCIÓN: descuenta stock y crea el pedido con sus ítems, o no hace nada
const create = async (userId, items) => {
  validateItems(items); const customer = await customerOf(userId);
  return prisma.$transaction(async (tx) => {
    const lines = []; let total = 0;
    for (const it of items) {
      const product = await tx.product.findUnique({ where: { id: it.productId } });
      if (!product) throw new HttpError(404, `Producto ${it.productId} no encontrado`);
      const updated = await tx.product.updateMany({ where: { id: it.productId, stock: { gte: it.quantity } }, data: { stock: { decrement: it.quantity } } });
      if (updated.count !== 1) throw new HttpError(409, `Stock insuficiente para ${product.name}`);
      total += Number(product.price) * it.quantity; lines.push({ productId: it.productId, quantity: it.quantity, unitPrice: product.price });
    }
    return tx.order.create({ data: { customerId: customer.id, total, items: { create: lines } }, include: orderInclude });
  });
};

const listByUser = async (userId) => {
  const customer = await customerOf(userId);
  return prisma.order.findMany({
    where: { customerId: customer.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const history = async (userId, role, orderId) => { const order=await prisma.order.findUnique({where:{id:orderId},select:{id:true,status:true,customer:{select:{userId:true}},history:{orderBy:{createdAt:'asc'},include:{changedBy:{select:{name:true}}}}}}); if(!order)throw new HttpError(404,'Pedido no encontrado'); if(role!=='ADMIN'&&order.customer.userId!==userId)throw new HttpError(403,'No puede consultar este pedido'); return {orderId:order.id,status:order.status,history:order.history}; };

// TRANSACCIÓN: cambia el estado y devuelve el stock de cada ítem
const cancel = async (userId, orderId) => {
  const customer = await customerOf(userId);
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new HttpError(404, "Pedido no encontrado");
    if (order.customerId !== customer.id) throw new HttpError(403, "El pedido no pertenece al usuario");
    if (order.status !== "PENDING") throw new HttpError(409, "Solo se pueden cancelar pedidos pendientes");
    // updateMany condicionado: si otro proceso cambió el estado, no se cancela dos veces
    const updated = await tx.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
    if (updated.count !== 1) throw new HttpError(409, "El pedido cambió mientras se procesaba");
    for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    // Reto opcional tarjeta C: la cancelación del cliente también queda en el historial
    await tx.orderStatusHistory.create({ data: { orderId, fromStatus: "PENDING", toStatus: "CANCELLED", note: "Cancelado por el cliente", changedById: userId } });
    return tx.order.findUnique({ where: { id: orderId }, include: orderInclude });
  });
};

module.exports = { create, listByUser, cancel, history };
