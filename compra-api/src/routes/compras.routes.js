const express = require("express");
const router = express.Router();
const comprasController = require("../controllers/compras.controller");

router.get("/", comprasController.obtenerCompras);
router.get("/:id", comprasController.obtenerCompra);
router.post("/", comprasController.crearCompra);

module.exports = router;