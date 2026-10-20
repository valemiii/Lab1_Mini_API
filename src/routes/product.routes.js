const { Router } = require("express");
const productController = require("../controllers/product.controller");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();

// ✅ Ya resueltas
router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

module.exports = router;
