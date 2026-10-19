const { Router } = require("express");
const productController = require("../controllers/product.controller");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();

// ✅ Ya resueltas
router.get("/", productController.list);
router.get("/:id", productController.getById);

// TODO Paso 2: agrega POST "/" → create, PUT "/:id" → update y DELETE "/:id" → remove

module.exports = router;
