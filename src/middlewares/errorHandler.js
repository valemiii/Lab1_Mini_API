const { Prisma } = require("@prisma/client");
const fromPrisma = (err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = err.meta?.target ?? err.meta?.driverAdapterError?.cause?.constraint?.index ?? "campo único";
      return { status: 409, message: `Ya existe un registro con ese valor único (${field})` };
    }
    if (err.code === "P2025") return { status: 404, message: "Registro no encontrado" };
    if (err.code === "P2003") return { status: 409, message: "No se puede eliminar: hay registros relacionados" };
  }
  if (err instanceof Prisma.PrismaClientValidationError) return { status: 400, message: "Datos con tipo o formato inválido" };
  return null;
};
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const mapped = fromPrisma(err);
  const malformed = err.type === "entity.parse.failed";
  const rawStatus = Number(err.status || err.statusCode);
  const status = mapped?.status ?? (malformed ? 400 : rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500);
  const message = mapped?.message ?? (malformed ? "El cuerpo de la solicitud contiene JSON mal formado" : status === 500 ? "Error interno del servidor" : err.message || "Solicitud incorrecta");
  const body = { error: message };
  if (status === 500) {
    console.error(err);
    if (process.env.NODE_ENV !== "production") body.stack = err.stack;
  }
  res.status(status).json(body);
};
module.exports = errorHandler;
