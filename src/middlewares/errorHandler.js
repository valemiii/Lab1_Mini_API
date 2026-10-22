// Manejador de errores: 4 parámetros. Responde siempre en JSON.
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

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
