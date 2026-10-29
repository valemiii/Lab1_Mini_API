const { Router } = require("express");
const productRoutes = require("./product.routes");
const authRoutes = require("./auth.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");

// Archivo principal de rutas: cada recurso se monta en su propio prefijo
const router = Router();

router.use("/products", productRoutes); // → /api/products · entidad principal del catálogo
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
