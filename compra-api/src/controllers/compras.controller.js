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

const actualizarCompra = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  const { clienteId, productoId, cantidad } = req.body;
  if (clienteId === undefined && productoId === undefined && cantidad === undefined) {
    return res.status(400).json({ mensaje: "Debe indicar al menos un campo a actualizar" });
  }

  const nuevoClienteId = clienteId !== undefined ? obtenerId(clienteId) : null;
  if (clienteId !== undefined && !nuevoClienteId) {
    return res.status(400).json({ mensaje: "El campo 'clienteId' debe ser un entero positivo" });
  }
  const nuevoProductoId = productoId !== undefined ? obtenerId(productoId) : null;
  if (productoId !== undefined && !nuevoProductoId) {
    return res.status(400).json({ mensaje: "El campo 'productoId' debe ser un entero positivo" });
  }

  let nuevaCantidad = null;
  if (cantidad !== undefined) {
    nuevaCantidad = Number(cantidad);
    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
      return res.status(400).json({ mensaje: "El campo 'cantidad' debe ser un entero positivo" });
    }
  }

  try {
    if (nuevoClienteId || nuevoProductoId) {
      const [cliente, producto] = await Promise.all([
        nuevoClienteId ? obtenerCliente(nuevoClienteId) : Promise.resolve(true),
        nuevoProductoId ? obtenerProducto(nuevoProductoId) : Promise.resolve(true),
      ]);
      if (!cliente) return res.status(404).json({ mensaje: `El cliente ${nuevoClienteId} no existe` });
      if (!producto) return res.status(404).json({ mensaje: `El producto ${nuevoProductoId} no existe` });
    }
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo actualizar la compra porque uno de los servicios no respondió",
      detalle: error.message,
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const compra = await Compra.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!compra) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    const productoAnterior = await Producto.findByPk(compra.producto_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!productoAnterior) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: `El producto ${compra.producto_id} no existe` });
    }

    const clienteFinal = nuevoClienteId || compra.cliente_id;
    const productoFinal = nuevoProductoId || compra.producto_id;
    const cantidadFinal = nuevaCantidad ?? compra.cantidad;
    const mismoProducto = productoFinal === compra.producto_id;

    let productoNuevo = productoAnterior;
    if (!mismoProducto) {
      productoNuevo = await Producto.findByPk(productoFinal, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!productoNuevo) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: `El producto ${productoFinal} no existe` });
      }
    }

    const stockDisponible =
      Number(productoNuevo.stock) + (mismoProducto ? Number(compra.cantidad) : 0);
    if (stockDisponible < cantidadFinal) {
      await transaction.rollback();
      return res.status(400).json({
        mensaje: `Stock insuficiente. Disponible: ${stockDisponible}, solicitado: ${cantidadFinal}`,
      });
    }

    if (!mismoProducto) {
      await productoAnterior.update(
        { stock: Number(productoAnterior.stock) + Number(compra.cantidad) },
        { transaction }
      );
    }
    await productoNuevo.update({ stock: stockDisponible - cantidadFinal }, { transaction });

    await compra.update(
      {
        cliente_id: clienteFinal,
        producto_id: productoFinal,
        cantidad: cantidadFinal,
        total: Number(productoNuevo.precio) * cantidadFinal,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json(compra);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: "Error al actualizar la compra", error: error.message });
  }
};

const eliminarCompra = async (req, res) => {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ mensaje: "El id debe ser un entero positivo" });

  const transaction = await sequelize.transaction();
  try {
    const compra = await Compra.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!compra) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    const producto = await Producto.findByPk(compra.producto_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: `El producto ${compra.producto_id} no existe` });
    }

    await producto.update(
      { stock: Number(producto.stock) + Number(compra.cantidad) },
      { transaction }
    );
    await compra.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: "Error al eliminar la compra", error: error.message });
  }
};

module.exports = {
  obtenerCompras,
  obtenerCompra,
  crearCompra,
  actualizarCompra,
  eliminarCompra,
};
