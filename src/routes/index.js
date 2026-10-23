const { Router } = require("express");
const productRoutes = require("./product.routes");

// Archivo principal de rutas: cada recurso se monta en su propio prefijo
const router = Router();

router.use("/products", productRoutes); // → /api/products · entidad principal del catálogo

module.exports = router;
