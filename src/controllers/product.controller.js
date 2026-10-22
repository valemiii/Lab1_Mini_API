const productService = require("../services/product.service");
const HttpError = require("../utils/httpError");

// CONTROLADOR: lee la petición (params, body), llama al servicio y decide código + JSON.
// No lee archivos ni valida reglas de negocio. Los errores van a next(err) → errorHandler.

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

// get 200
const list = async (req, res, next) => {
  try {
    res.json(await productService.list());
  } catch (err) {
    next(err);
  }
};

// get 200
const getById = async (req, res, next) => {
  try {
    res.json(await productService.getById(parseId(req)));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const item = await productService.create(req.body ?? {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await productService.update(parseId(req), req.body ?? {});
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(parseId(req));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
