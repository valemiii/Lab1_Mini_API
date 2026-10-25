const jwt = require("jsonwebtoken");
const HttpError = require("../utils/httpError");

const authenticateToken = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return next(new HttpError(401, "Acceso denegado: falta el token"));
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err || !payload || !Number.isInteger(payload.id) || typeof payload.role !== "string") return next(new HttpError(403, "Token inválido o expirado"));
    req.user = payload;
    next();
  });
};
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, "No tienes permisos para esta operación"));
  next();
};
module.exports = { authenticateToken, requireRole };
