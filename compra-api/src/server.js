require("dotenv").config();
const express = require("express");
const comprasRoutes = require("./routes/compras.routes");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use("/compras", comprasRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "compra-api activa" });
});

sequelize.authenticate().then(() => {
  console.log("Conectado a la base de datos PostgreSQL");
  app.listen(PORT, () => {
    console.log(`compra-api escuchando en el puerto ${PORT}`);
  });
}).catch((error) => {
  console.error("Error al conectar con la base de datos:", error.message);
  process.exitCode = 1;
});