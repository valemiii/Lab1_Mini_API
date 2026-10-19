// TODO Paso 3: registra hora, verbo y ruta de cada petición (diapositiva «Los middlewares…»)
// Reto opcional: registra también el código de estado y la duración usando res.on("finish", ...)
const logger = (req, res, next) => {
  // Escribe aquí tu console.log(...)

  next(); // no lo borres: sin next() la petición se queda colgada
};

module.exports = logger;
