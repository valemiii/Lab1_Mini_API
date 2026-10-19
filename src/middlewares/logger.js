// Registra cada petición cuando termina para incluir su estado HTTP y duración.
const logger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)} ms`,
    );
  });

  next();
};

module.exports = logger;
