const prisma = require('../db/prisma');
const HttpError = require('../utils/httpError');

const reviewAuthor = { select: { id: true, name: true } };

const parseReview = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON');
  }

  const keys = Object.keys(input);
  if (keys.some((key) => !['rating', 'comment'].includes(key))) {
    throw new HttpError(400, 'Incluye rating o comment válidos');
  }

  const result = {};
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new HttpError(400, 'rating debe ser un entero entre 1 y 5');
  }
  result.rating = input.rating;

  if (Object.hasOwn(input, 'comment')) {
    if (input.comment !== null && (typeof input.comment !== 'string' || input.comment.length > 300)) {
      throw new HttpError(400, 'comment debe tener máximo 300 caracteres');
    }
    result.comment = input.comment;
  }

  return result;
};

const parsePage = (value, fallback, field) => {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new HttpError(400, `${field} debe ser un entero positivo`);
  }
  return number;
};

const requireProduct = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw new HttpError(404, 'Producto no encontrado');
};

const requireReview = async (reviewId) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Reseña no encontrada');
  return review;
};

const authorizeOwnerOrAdmin = (review, userId, role) => {
  if (role !== 'ADMIN' && review.userId !== userId) {
    throw new HttpError(403, 'Solo el autor o ADMIN puede eliminar esta reseña');
  }
};

const createReview = async (userId, productId, input) => {
  const data = parseReview(input);
  await requireProduct(productId);

  try {
    return await prisma.review.create({
      data: { ...data, userId, productId },
      include: { user: reviewAuthor },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'El usuario ya reseñó este producto');
    }
    throw error;
  }
};

const listProductReviews = async (productId, query) => {
  await requireProduct(productId);

  const page = parsePage(query.page, 1, 'page');
  const limit = Math.min(parsePage(query.limit, 10, 'limit'), 50);
  const where = { productId };
  const [total, data, result] = await prisma.$transaction([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: { user: reviewAuthor },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.aggregate({ where, _avg: { rating: true } }),
  ]);

  return {
    productId,
    average: result._avg.rating ?? 0,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    data,
  };
};

const deleteReview = async (userId, role, reviewId) => {
  const review = await requireReview(reviewId);
  authorizeOwnerOrAdmin(review, userId, role);
  await prisma.review.delete({ where: { id: reviewId } });
};

module.exports = { createReview, listProductReviews, deleteReview };
