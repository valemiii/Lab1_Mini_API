const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL es obligatorio para conectar con PostgreSQL");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Una sola instancia para toda la app (no crees un PrismaClient por petición)
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"],
});

module.exports = prisma;
