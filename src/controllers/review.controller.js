const reviewService = require('../services/review.service');
const HttpError = require('../utils/httpError');

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }
  return id;
};

const create = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.id, parseId(req.params.id), req.body);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const reviews = await reviewService.listProductReviews(parseId(req.params.id), req.query);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.user.id, req.user.role, parseId(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, remove };
