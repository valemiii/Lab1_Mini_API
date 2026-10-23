// SERVER: solo levanta el servidor. La configuración de Express vive en app.js
require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo conectar con PostgreSQL:", error);
    process.exitCode = 1;
  }
};

start();
