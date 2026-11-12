const productService = require("../services/product.service");
const categoryService = require("../services/category.service");
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

const createMany = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "El body debe ser un arreglo" });
    }
    const created = await productService.createMany(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

const search = async (req,res,next) => { try { res.json(await categoryService.search(req.query)); } catch (err) { next(err); } };
const setCategories = async (req,res,next) => { try { res.json(await categoryService.setProductCategories(parseId(req), req.body?.categoryIds)); } catch (err) { next(err); } };

module.exports = { list, getById, create, update, remove, createMany, search, setCategories };
