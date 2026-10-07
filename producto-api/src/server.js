require("dotenv").config();
const express = require("express");
const productosRoutes = require("./routes/productos.routes");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use("/productos", productosRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "producto-api activa" });
});

sequelize.authenticate().then(() => {
  console.log("Conectado a la base de datos PostgreSQL");
  app.listen(PORT, () => {
    console.log(`producto-api escuchando en el puerto ${PORT}`);
  });
}).catch((error) => {
  console.error("Error al conectar con la base de datos:", error.message);
  process.exitCode = 1;
});