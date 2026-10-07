const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Compra = sequelize.define("Compra", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  fecha: { type: DataTypes.DATE },
}, {
  tableName: "compras",
  timestamps: false,
});

module.exports = Compra;
