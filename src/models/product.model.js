const prisma = require("../db/prisma");

const FIELDS = ["name", "institution", "category", "price"];

const pick = (data) =>
  Object.fromEntries(FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));

const toResponse = (product) => {
  const item = { ...product };
  if (item.institution === null) delete item.institution;
  if (item.category === null) delete item.category;
  return item;
};

const readAll = async () =>
  (await prisma.product.findMany({ orderBy: { id: "asc" } })).map(toResponse);

const findById = async (id) => {
  const item = await prisma.product.findUnique({ where: { id } });
  return item ? toResponse(item) : null;
};

const create = async (data) => toResponse(await prisma.product.create({ data: pick(data) }));

const update = async (id, data) => {
  const fields = pick(data);
  if (Object.keys(fields).length === 0) return findById(id);

  const result = await prisma.product.updateMany({ where: { id }, data: fields });
  return result.count === 0 ? null : findById(id);
};

const remove = async (id) => {
  const result = await prisma.product.deleteMany({ where: { id } });
  return result.count > 0;
};

module.exports = { FIELDS, readAll, findById, create, update, remove, pick };
