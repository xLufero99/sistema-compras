const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productos.controller");

router.get("/", productosController.obtenerProductos);
router.get("/:id", productosController.obtenerProducto);
router.post("/", productosController.crearProducto);

module.exports = router;