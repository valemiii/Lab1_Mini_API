const Product = require("../models/product.model");
const HttpError = require("../utils/httpError");

// SERVICIO: reglas de negocio y acceso a datos a través del modelo.
// Lanza HttpError (400, 404) cuando una regla no se cumple. En el Lab 2 este archivo
// usará Prisma; el controlador y las rutas no cambian.

// Devuelve un mensaje de error o null si los datos son válidos.
// partial = true en PUT: valida solo los campos que llegan.
// TODO Paso 1: al menos 2 validaciones de TU entidad.
const validate = (data, { partial = false } = {}) => {
  // Ejemplo: if (typeof data.name !== "string" || data.name.trim().length < 3) return "name ...";
  return null;
};

// ✅ Ya resuelto: úsalo como guía
const list = () => Product.readAll();

// ✅ Ya resuelto
const getById = async (id) => {
  const item = (await Product.readAll()).find((p) => p.id === id);
  if (!item) throw new HttpError(404, "Producto no encontrado");
  return item;
};

// TODO Paso 2: valida (400), genera el id (máximo + 1), agrega el registro con Product.pick, guarda y devuélvelo
const create = async (data) => {
  throw new HttpError(501, "create() pendiente en el servicio");
};

// TODO Paso 2: valida con { partial: true } (400); si el id no existe lanza 404; mezcla los campos, guarda y devuélvelo
const update = async (id, data) => {
  throw new HttpError(501, "update() pendiente en el servicio");
};

// TODO Paso 2: elimina por id; si no existía lanza 404
const remove = async (id) => {
  throw new HttpError(501, "remove() pendiente en el servicio");
};

module.exports = { list, getById, create, update, remove };
