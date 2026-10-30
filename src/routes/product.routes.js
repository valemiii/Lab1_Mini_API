const { Router } = require("express");
const productController = require("../controllers/product.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// Leer el catálogo es público; modificarlo, solo ADMIN
const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

router.get("/", productController.list);
router.get("/search", productController.search);
router.put("/:id/categories", onlyAdmin, productController.setCategories);
router.get("/:id", productController.getById);
router.post("/", onlyAdmin, productController.create);
router.post("/lote", onlyAdmin, productController.createMany);
router.put("/:id", onlyAdmin, productController.update);
router.delete("/:id", onlyAdmin, productController.remove);

module.exports = router;
