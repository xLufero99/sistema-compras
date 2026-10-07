const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Producto = sequelize.define("Producto", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  precio: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "productos",
  timestamps: false,
});

module.exports = Producto;
