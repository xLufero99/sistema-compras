require("dotenv").config();
const express = require("express");
const clientesRoutes = require("./routes/clientes.routes");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/clientes", clientesRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "cliente-api activa" });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado a la base de datos PostgreSQL");
    app.listen(PORT, () => {
      console.log(`cliente-api escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error.message);
    process.exitCode = 1;
  });