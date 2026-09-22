const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /productos
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM productos ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar los productos", error: error.message });
  }
});

// GET /productos/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await db.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el producto", error: error.message });
  }
});

// POST /productos
router.post("/", async (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios" });
  }

  try {
    const result = await db.query(
      "INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *",
      [nombre, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el producto", error: error.message });
  }
});

module.exports = router;