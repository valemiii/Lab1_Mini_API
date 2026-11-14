const { Router } = require("express");
const resenaController = require("../controllers/resena.controller");

const router = Router();

router.post("/resenas", resenaController.crear);

module.exports = router;
