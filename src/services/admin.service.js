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

const updateOrderStatus = async (id, status, note, changedById) => {
  if (status === undefined) throw new HttpError(400, "Envía el nuevo status");
  const next = parseStatus(status);
  const allowed = { PENDING: ['CONFIRMED','CANCELLED'], CONFIRMED: ['DELIVERED','CANCELLED'], DELIVERED: [], CANCELLED: [] };
  return prisma.$transaction(async tx => { const order=await tx.order.findUnique({where:{id}}); if(!order)throw new HttpError(404,'Pedido no encontrado'); if(!allowed[order.status].includes(next))throw new HttpError(409,`Transición no permitida: ${order.status} → ${next}`); const updated=await tx.order.updateMany({where:{id,status:order.status},data:{status:next}}); if(updated.count!==1)throw new HttpError(409,'El pedido cambió mientras se procesaba'); if(next==='CANCELLED') for(const item of await tx.orderItem.findMany({where:{orderId:id}})) await tx.product.update({where:{id:item.productId},data:{stock:{increment:item.quantity}}}); await tx.orderStatusHistory.create({data:{orderId:id,fromStatus:order.status,toStatus:next,note,changedById}}); return tx.order.findUnique({where:{id},include:{history:{orderBy:{createdAt:'asc'}}}}); });
};

// Consulta avanzada: agrupa los ítems por producto y suma unidades vendidas
const topProducts = async (limit) => {
  const take = toInt(limit, 5, 50); const rows = await prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, where: { order: { status: { not: "CANCELLED" } } }, orderBy: { _sum: { quantity: "desc" } }, take });
  const products = await prisma.product.findMany({ where: { id: { in: rows.map((r) => r.productId) } }, select: { id: true, name: true } });
  return rows.map((r) => ({ productId: r.productId, name: products.find((p) => p.id === r.productId)?.name, unitsSold: r._sum.quantity }));
};

const stats = async ({from,to}) => { const date={...(from?{gte:new Date(from)}:{}),...(to?{lte:new Date(to)}:{})}; if((from&&Number.isNaN(date.gte.getTime()))||(to&&Number.isNaN(date.lte.getTime())))throw new HttpError(400,'Fecha inválida'); const where=from||to?{createdAt:date}:{}; const [ordersByStatus,revenue,topCustomers]=await prisma.$transaction([prisma.order.groupBy({by:['status'],where,_count:{_all:true}}),prisma.order.aggregate({where:{...where,status:'DELIVERED'},_sum:{total:true},_avg:{total:true}}),prisma.order.groupBy({by:['customerId'],where,status:'DELIVERED',_sum:{total:true},orderBy:{_sum:{total:'desc'}},take:3})]); return {ordersByStatus,revenue:{total:revenue._sum.total||0,average:revenue._avg.total||0},topCustomers}; };

module.exports = { listOrders, updateOrderStatus, topProducts, stats };
