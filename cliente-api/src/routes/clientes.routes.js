const express = require("express");
const router = express.Router();
const clientesController = require("../controllers/clientes.controller");

router.get("/", clientesController.obtenerClientes);
router.get("/:id", clientesController.obtenerCliente);
router.post("/", clientesController.crearCliente);
router.put("/:id", clientesController.actualizarCliente);
router.delete("/:id", clientesController.eliminarCliente);

module.exports = router;