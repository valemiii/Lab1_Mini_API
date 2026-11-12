const prisma = require('../db/prisma');
const HttpError = require('../utils/httpError');
const pageArgs = (page, limit) => ({ page: Math.max(1, Number(page) || 1), limit: Math.min(50, Math.max(1, Number(limit) || 10)) });

const create = async (userId, productId, data = {}) => {
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) throw new HttpError(400, 'rating debe ser un entero entre 1 y 5');
  if (data.comment !== undefined && (typeof data.comment !== 'string' || data.comment.length > 300)) throw new HttpError(400, 'comment debe tener máximo 300 caracteres');
  if (!await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })) throw new HttpError(404, 'Producto no encontrado');
  try { return await prisma.review.create({ data: { userId, productId, rating: data.rating, comment: data.comment }, include: { user: { select: { id: true, name: true } } } }); }
  catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'El usuario ya reseñó este producto'); throw e; }
};
const list = async (productId, page, limit) => {
  const args = pageArgs(page, limit); const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw new HttpError(404, 'Producto no encontrado');
  const where = { productId }; const [total, data, average] = await prisma.$transaction([prisma.review.count({ where }), prisma.review.findMany({ where, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, skip: (args.page - 1) * args.limit, take: args.limit }), prisma.review.aggregate({ where, _avg: { rating: true } })]);
  return { productId, average: average._avg.rating || 0, total, page: args.page, limit: args.limit, pages: Math.ceil(total / args.limit), data };
};
const remove = async (userId, role, id) => { const review = await prisma.review.findUnique({ where: { id } }); if (!review) throw new HttpError(404, 'Reseña no encontrada'); if (role !== 'ADMIN' && review.userId !== userId) throw new HttpError(403, 'Solo el autor o ADMIN puede eliminarla'); await prisma.review.delete({ where: { id } }); };
module.exports = { create, list, remove };
