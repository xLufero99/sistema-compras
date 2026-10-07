const sequelize = require("../config/db");
const Compra = require("../models/compra.model");
const Producto = require("../models/producto.model");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

const obtenerId = (id) => {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
};

const obtenerCompras = async (req, res) => {
  try {
    res.status(200).json(await Compra.findAll({ order: [["id", "ASC"]] }));
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las compras", error: error.message });
  }
};

const obtenerCompra = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });
  try {
    const compra = await Compra.findByPk(id);
    if (!compra) return res.status(404).json({ mensaje: "Compra no encontrada" });
    res.status(200).json(compra);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar la compra", error: error.message });
  }
};

const crearCompra = async (req, res) => {
  const { clienteId, productoId, cantidad } = req.body;
  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios",
    });
  }

  try {
    const [cliente, producto] = await Promise.all([
      obtenerCliente(clienteId),
      obtenerProducto(productoId),
    ]);
    if (!cliente) return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
    if (!producto) return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message,
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const productoActual = await Producto.findByPk(productoId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!productoActual) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
    }
    if (productoActual.stock < cantidad) {
      await transaction.rollback();
      return res.status(400).json({
        mensaje: `Stock insuficiente. Disponible: ${productoActual.stock}, solicitado: ${cantidad}`,
      });
    }

    const compra = await Compra.create({
      cliente_id: clienteId,
      producto_id: productoId,
      cantidad,
      total: Number(productoActual.precio) * cantidad,
    }, { transaction });
    await productoActual.update(
      { stock: productoActual.stock - cantidad },
      { transaction }
    );
    await transaction.commit();
    res.status(201).json(compra);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: "Error al procesar la compra", error: error.message });
  }
};

module.exports = { obtenerCompras, obtenerCompra, crearCompra };
