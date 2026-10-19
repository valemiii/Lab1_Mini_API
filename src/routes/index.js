const { Router } = require("express");
const productRoutes = require("./product.routes");

// Archivo principal de rutas: cada recurso se monta en su propio prefijo
const router = Router();

router.use("/products", productRoutes); // → /api/products · TODO Paso 1: cambia /products por tu entidad

module.exports = router;
