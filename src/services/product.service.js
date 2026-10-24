const { randomUUID } = require("node:crypto");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const FIELDS = ["name", "institution", "category", "price", "notes", "sku"];
const parsePrice = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? Number.NaN : Number(trimmed);
  }
  return Number(value);
};
const pick = (data) => {
  const picked = Object.fromEntries(FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));
  if (picked.price !== undefined) {
    picked.price = parsePrice(picked.price);
  }
  return picked;
};
const toResponse = (product) => ({ ...product, price: Number(product.price) });

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
    const price = parsePrice(data.price);
    if (!Number.isFinite(price) || price < 0) {
      return "price debe ser un número mayor o igual a 0";
    }
  }
  for (const key of ["institution", "category", "notes", "sku"]) {
    if (data[key] !== undefined && typeof data[key] !== "string") {
      return `${key} debe ser texto`;
    }
  }
  return null;
};

const list = async () => (await prisma.product.findMany({ orderBy: { id: "asc" } })).map(toResponse);
const getById = async (id) => {
  const item = await prisma.product.findUnique({ where: { id } });
  if (!item) throw new HttpError(404, "Producto no encontrado");
  return toResponse(item);
};
const create = async (data) => {
  const error = validate(data);
  if (error) throw new HttpError(400, error);
  return toResponse(await prisma.product.create({ data: { ...pick(data), sku: data.sku || `API-${randomUUID()}` } }));
};
const update = async (id, data) => {
  const error = validate(data, { partial: true });
  if (error) throw new HttpError(400, error);
  return toResponse(await prisma.product.update({ where: { id }, data: pick(data) }));
};
const remove = async (id) => {
  await prisma.product.delete({ where: { id } });
};
const createMany = async (items) =>
  prisma.$transaction(async (tx) => {
    const created = [];
    for (const [index, data] of items.entries()) {
      const error = validate(data);
      if (error) throw new HttpError(400, `Ítem ${index + 1}: ${error}`);
      created.push(
        toResponse(await tx.product.create({ data: { ...pick(data), sku: data.sku || `API-${randomUUID()}` } })),
      );
    }
    return created;
  });

module.exports = { FIELDS, validate, list, getById, create, update, remove, createMany };
