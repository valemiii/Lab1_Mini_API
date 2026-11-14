const mongoose = require("mongoose");

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI es obligatoria para iniciar la API.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch {
    throw new Error("No se pudo conectar a MongoDB. Verifica el servicio y la configuración de MONGODB_URI.");
  }

  console.log(`Conexión a MongoDB establecida (${mongoose.connection.name}).`);
};

const disconnectMongo = () => mongoose.disconnect();

module.exports = { connectMongo, disconnectMongo };
