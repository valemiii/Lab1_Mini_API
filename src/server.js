require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");
const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET es obligatorio y debe tener al menos 32 caracteres");
    await prisma.$connect();
    const server = app.listen(PORT, () => console.log(`Servidor ejecutándose en puerto ${PORT}`));
    const shutdown = async () => { server.close(); await prisma.$disconnect(); process.exit(0); };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("No se pudo iniciar la API:", error.message);
    process.exit(1);
  }
};
start();
