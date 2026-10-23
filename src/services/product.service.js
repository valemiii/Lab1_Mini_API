const Product = require("../models/product.model");
const HttpError = require("../utils/httpError");

// SERVICIO: reglas de negocio y acceso a datos a través del modelo.
// Lanza HttpError (400, 404) cuando una regla no se cumple.

// Devuelve un mensaje de error o null si los datos son válidos.
// partial = true en PUT: valida solo los campos que llegan.
const validate = (data, { partial = false } = {}) => {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return "Los datos del producto deben ser un objeto";
  }
  if (!partial || data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length < 3) {
      return "name debe tener al menos 3 caracteres";
    }
  }
  if (!partial || data.price !== undefined) {
    if (typeof data.price !== "number" || Number.isNaN(data.price) || data.price < 0) {
      return "price debe ser un número mayor o igual a 0";
    }
  }
  return null;
};

// ✅ Ya resuelto: úsalo como guía
const list = () => Product.readAll();

// ✅ Ya resuelto
const getById = async (id) => {
  const item = await Product.findById(id);
  if (!item) throw new HttpError(404, "Producto no encontrado");
  return item;
};

const create = async (data) => {
  const error = validate(data);
  if (error) throw new HttpError(400, error);

  return Product.create(data);
};

const update = async (id, data) => {
  const error = validate(data, { partial: true });
  if (error) throw new HttpError(400, error);

  const item = await Product.update(id, data);
  if (!item) throw new HttpError(404, "Producto no encontrado");
  return item;
};

const remove = async (id) => {
  const removed = await Product.remove(id);
  if (!removed) {
    throw new HttpError(404, "Producto no encontrado");
  }
};

module.exports = { list, getById, create, update, remove };
