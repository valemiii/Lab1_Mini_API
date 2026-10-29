const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de autenticación: reglas, hash de contraseñas y emisión del JWT

// Campos que se devuelven del usuario: nunca la contraseña
const publicUser = { id: true, email: true, name: true, role: true, customer: true };

const register = async ({ email, password, name, phone }) => {
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8 || !name)
    throw new HttpError(400, "email válido, name y password de al menos 8 caracteres son obligatorios");
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email: email.toLowerCase().trim(), password: hash, name, customer: { create: { fullName: name, email: email.toLowerCase().trim(), phone } } }, select: publicUser });
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email: String(email || "").toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(password || "", user.password))) throw new HttpError(401, "Credenciales inválidas");
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "4h" });
};

const getProfile = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  return user;
};

module.exports = { register, login, getProfile };
