const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const publicUser = { id: true, email: true, name: true, role: true, customer: { select: { id: true, fullName: true, email: true, phone: true } } };
const normalizeEmail = (email) => typeof email === "string" ? email.trim().toLowerCase() : "";
const validateCredentials = ({ email, password, name }) => {
  if (!normalizeEmail(email) || normalizeEmail(email).length > 120 || !/^\S+@\S+\.\S+$/.test(normalizeEmail(email))) return "email debe ser válido y tener hasta 120 caracteres";
  if (typeof password !== "string" || password.length < 8) return "password debe tener al menos 8 caracteres";
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100)) return "name debe tener entre 2 y 100 caracteres";
  return null;
};

const register = async (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "Envía email, password y name");
  const { email, password, name, phone } = input;
  const error = validateCredentials({ email, password, name });
  if (error) throw new HttpError(400, error);
  if (phone !== undefined && phone !== null && (typeof phone !== "string" || phone.length > 15)) throw new HttpError(400, "phone debe tener hasta 15 caracteres");
  const normalizedEmail = normalizeEmail(email);
  const safeName = name.trim();
  return prisma.user.create({
    data: {
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      name: safeName,
      customer: { create: { fullName: safeName, email: normalizedEmail, phone: phone?.trim() || null } },
    },
    select: publicUser,
  });
};

const login = async (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "Envía email y password");
  const email = normalizeEmail(input.email);
  const password = input.password;
  if (!email || typeof password !== "string") throw new HttpError(400, "Envía email y password");
  const user = await prisma.user.findUnique({ where: { email } });
  const matches = user ? await bcrypt.compare(password, user.password) : false;
  if (!matches) throw new HttpError(401, "Credenciales inválidas");
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "4h" });
  return token;
};

const getProfile = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  return user;
};
module.exports = { register, login, getProfile };
