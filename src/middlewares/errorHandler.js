// Manejador de errores: 4 parámetros. Responde siempre en JSON.
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Ya existe un registro con ese valor único" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const isMalformedJson = err.type === "entity.parse.failed";
  const requestedStatus = Number(err.status || err.statusCode);
  const status = isMalformedJson ? 400 : requestedStatus >= 400 && requestedStatus < 600 ? requestedStatus : 500;
  const isInternalError = status === 500;
  const message = isMalformedJson
    ? "El cuerpo de la solicitud contiene JSON mal formado"
    : isInternalError
      ? "Error interno del servidor"
      : err.message || "Solicitud incorrecta";
  const payload = { error: message };

  if (isInternalError && process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

module.exports = errorHandler;
