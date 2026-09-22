const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on("connect", () => {
  console.log("Conectado a la base de datos PostgreSQL");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};