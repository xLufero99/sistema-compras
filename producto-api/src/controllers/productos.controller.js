const { ValidationError } = require("sequelize");
const Producto = require("../models/producto.model");

const obtenerId = (id) => {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
};

const obtenerProductos = async (req, res) => {
  try {
    res.status(200).json(await Producto.findAll({ order: [["id", "ASC"]] }));
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar los productos", error: error.message });
  }
};

const obtenerProducto = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });
  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el producto", error: error.message });
  }
};

const crearProducto = async (req, res) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios" });
  }
  try {
    res.status(201).json(await Producto.create({ nombre, precio, stock }));
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ mensaje: error.message });
    res.status(500).json({ mensaje: "Error al crear el producto", error: error.message });
  }
};

module.exports = { obtenerProductos, obtenerProducto, crearProducto };
