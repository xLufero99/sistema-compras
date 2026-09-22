const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

// GET /compras
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM compras ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las compras", error: error.message });
  }
});

// GET /compras/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await db.query("SELECT * FROM compras WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar la compra", error: error.message });
  }
});

// POST /compras
router.post("/", async (req, res) => {
  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
  }

  let cliente;
  let producto;

  try {
    cliente = await obtenerCliente(clienteId);
    producto = await obtenerProducto(productoId);
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message
    });
  }

  if (!cliente) {
    return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
  }

  if (!producto) {
    return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  }

  if (producto.stock < cantidad) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`
    });
  }

  const totalCalculado = producto.precio * cantidad;

  // Manejo de Transacción SQL con Pool de PostgreSQL
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insertar la compra
    const resultCompra = await client.query(
      `INSERT INTO compras (cliente_id, producto_id, cantidad, total) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [clienteId, productoId, cantidad, totalCalculado]
    );

    // 2. Descontar el stock en la tabla de productos
    await client.query(
      "UPDATE productos SET stock = stock - $1 WHERE id = $2",
      [cantidad, productoId]
    );

    await client.query("COMMIT");
    res.status(201).json(resultCompra.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ mensaje: "Error al procesar la compra", error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;