const { ValidationError, UniqueConstraintError } = require("sequelize");
const Cliente = require("../models/cliente.model");

const obtenerId = (id) => {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
};

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los clientes", error: error.message });
  }
};

const obtenerCliente = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar el cliente", error: error.message });
  }
};

const crearCliente = async (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  try {
    const cliente = await Cliente.create({ nombre, email });
    res.status(201).json(cliente);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ mensaje: "El email ya está registrado" });
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: "Error al registrar cliente", error: error.message });
  }
};

const actualizarCliente = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  const { nombre, email } = req.body;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    await cliente.update({
      ...(nombre !== undefined && { nombre }),
      ...(email !== undefined && { email }),
    });
    res.status(200).json(cliente);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ mensaje: "El email ya está registrado" });
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: "Error al actualizar cliente", error: error.message });
  }
};

const eliminarCliente = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  try {
    const cantidad = await Cliente.destroy({ where: { id } });
    if (!cantidad) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar cliente", error: error.message });
  }
};

module.exports = {
  obtenerClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
