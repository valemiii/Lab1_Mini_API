// Manejador de errores: 4 parámetros. Responde siempre en JSON.
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  // TODO Paso 3:
  //  a) Si el body trae JSON mal formado (err.type === "entity.parse.failed") responde 400.
  //  b) Si status es 500, responde "Error interno del servidor" y agrega err.stack
  //     solo cuando process.env.NODE_ENV !== "production".
  res.status(status).json({ error: err.message });
};

module.exports = errorHandler;
