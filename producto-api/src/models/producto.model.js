const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Producto = sequelize.define("Producto", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  precio: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  creado_en: { type: DataTypes.DATE },
}, {
  tableName: "productos",
  timestamps: true,
  createdAt: "creado_en",
  updatedAt: false,
});

module.exports = Producto;
