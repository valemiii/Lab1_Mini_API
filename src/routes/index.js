const { Router } = require("express");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");

// Archivo principal de rutas: cada recurso se monta en su propio prefijo
const router = Router();

router.use("/auth", authRoutes); // → /api/auth
router.use("/products", productRoutes); // → /api/products
router.use("/orders", orderRoutes); // → /api/orders
router.use("/admin", adminRoutes); // → /api/admin

module.exports = router;
