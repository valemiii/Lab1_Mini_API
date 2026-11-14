const prisma = require("../db/prisma");
const Resena = require("../models/resena");
const HttpError = require("../utils/httpError");

const crear = async (entrada = {}) => {
  const datos = entrada && typeof entrada === "object" && !Array.isArray(entrada) ? entrada : {};
  const resena = new Resena({
    productoId: datos.productoId,
    usuarioId: datos.usuarioId,
    calificacion: datos.calificacion,
    comentario: datos.comentario,
    imagenes: datos.imagenes == null ? undefined : datos.imagenes,
    estado: datos.estado,
    respuestaEmpresa: datos.respuestaEmpresa,
  });

  // Validar primero para que un UUID incorrecto produzca 400, no un error SQL.
  await resena.validate();

  const [producto, usuario] = await Promise.all([
    prisma.product.findUnique({
      where: { uuid: resena.productoId },
      select: { uuid: true },
    }),
    prisma.user.findUnique({
      where: { uuid: resena.usuarioId },
      select: { uuid: true },
    }),
  ]);

  if (!producto) {
    throw new HttpError(404, "El producto indicado en productoId no existe");
  }
  if (!usuario) {
    throw new HttpError(404, "El usuario indicado en usuarioId no existe");
  }

  return resena.save();
};

module.exports = { crear };
