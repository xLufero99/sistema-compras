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

const actualizarProducto = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  const { nombre, precio, stock } = req.body;
  if (nombre === undefined && precio === undefined && stock === undefined) {
    return res.status(400).json({ mensaje: "Debe indicar al menos un campo a actualizar" });
  }

  const cambios = {};
  if (nombre !== undefined) {
    if (!nombre) return res.status(400).json({ mensaje: "El campo 'nombre' no puede estar vacío" });
    cambios.nombre = nombre;
  }
  if (precio !== undefined) {
    const precioNum = Number(precio);
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      return res.status(400).json({ mensaje: "El campo 'precio' debe ser un número mayor o igual a 0" });
    }
    cambios.precio = precioNum;
  }
  if (stock !== undefined) {
    const stockNum = Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      return res.status(400).json({ mensaje: "El campo 'stock' debe ser un entero mayor o igual a 0" });
    }
    cambios.stock = stockNum;
  }

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });

    await producto.update(cambios);
    res.status(200).json(producto);
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ mensaje: error.message });
    res.status(500).json({ mensaje: "Error al actualizar el producto", error: error.message });
  }
};

const esViolacionForeignKey = (error) =>
  error.name === "SequelizeForeignKeyConstraintError" ||
  error.original?.code === "23503" ||
  /foreign key constraint|RESTRICT setting/i.test(error.message || "");

const eliminarProducto = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  try {
    const cantidad = await Producto.destroy({ where: { id } });
    if (!cantidad) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.status(204).send();
  } catch (error) {
    if (esViolacionForeignKey(error)) {
      return res.status(409).json({
        mensaje: "No se puede eliminar el producto porque tiene compras asociadas",
      });
    }
    res.status(500).json({ mensaje: "Error al eliminar el producto", error: error.message });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
