const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /clientes
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clientes ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los clientes", error: error.message });
  }
});

// GET /clientes/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await db.query("SELECT * FROM clientes WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar el cliente", error: error.message });
  }
});

// POST /clientes
router.post("/", async (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  try {
    const result = await db.query(
      "INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING *",
      [nombre, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar cliente", error: error.message });
  }
});

// PUT /clientes/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, email } = req.body;

  try {
    const result = await db.query(
      "UPDATE clientes SET nombre = COALESCE($1, nombre), email = COALESCE($2, email) WHERE id = $3 RETURNING *",
      [nombre, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar cliente", error: error.message });
  }
});

// DELETE /clientes/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await db.query("DELETE FROM clientes WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar cliente", error: error.message });
  }
});

module.exports = router;