const { randomUUID } = require("node:crypto");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const FIELDS = ["name", "institution", "category", "categoryId", "price", "notes", "sku", "stock"];
const parsePrice = (value) => typeof value === "string" ? (value.trim() === "" ? Number.NaN : Number(value.trim())) : Number(value);
const pick = (data) => {
  const picked = Object.fromEntries(FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));
  if (picked.price !== undefined) picked.price = parsePrice(picked.price);
  return picked;
};
const toResponse = (product) => ({ ...product, price: Number(product.price) });
const validate = (data, { partial = false } = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "Los datos del producto deben ser un objeto";
  if (!partial || data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length < 3) return "name debe tener al menos 3 caracteres";
  }
  if (!partial || data.price !== undefined) {
    const price = parsePrice(data.price);
    if (!Number.isFinite(price) || price < 0) return "price debe ser un número mayor o igual a 0";
  }
  for (const key of ["institution", "category", "notes", "sku"]) if (data[key] !== undefined && typeof data[key] !== "string") return `${key} debe ser texto`;
  if (data.stock !== undefined && (!Number.isInteger(data.stock) || data.stock < 0)) return "stock debe ser un entero mayor o igual a 0";
  if (data.categoryId !== undefined && data.categoryId !== null && (!Number.isInteger(data.categoryId) || data.categoryId < 1)) return "categoryId debe ser un entero positivo o null";
  return null;
};
const resolveCategory = async (data) => {
  if (data.categoryId !== undefined) return data.categoryId;
  if (typeof data.category === "string" && data.category.trim()) {
    const category = await prisma.category.findUnique({ where: { name: data.category.trim() }, select: { id: true } });
    return category?.id ?? null;
  }
  return null;
};
const categoryData = async (data, partial) => {
  const selected = pick(data);
  if (!partial || data.categoryId !== undefined || data.category !== undefined) selected.categoryId = await resolveCategory(data);
  return selected;
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
  const payload = await categoryData(data, false);
  return toResponse(await prisma.product.create({ data: { ...payload, sku: data.sku || `API-${randomUUID()}` } }));
};
const update = async (id, data) => {
  const error = validate(data, { partial: true });
  if (error) throw new HttpError(400, error);
  return toResponse(await prisma.product.update({ where: { id }, data: await categoryData(data, true) }));
};
const remove = async (id) => { await prisma.product.delete({ where: { id } }); };
const createMany = async (items) => prisma.$transaction(async (tx) => {
  const created = [];
  for (const [index, data] of items.entries()) {
    const error = validate(data);
    if (error) throw new HttpError(400, `Ítem ${index + 1}: ${error}`);
    const payload = pick(data);
    if (data.categoryId === undefined && data.category) {
      const category = await tx.category.findUnique({ where: { name: data.category.trim() }, select: { id: true } });
      payload.categoryId = category?.id ?? null;
    }
    if (payload.categoryId === undefined) payload.categoryId = null;
    created.push(toResponse(await tx.product.create({ data: { ...payload, sku: data.sku || `API-${randomUUID()}` } })));
  }
  return created;
});
module.exports = { FIELDS, validate, list, getById, create, update, remove, createMany };
