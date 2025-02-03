"use strict";
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

pool.connect((err) => {
  if (err) {
    console.error("Błąd połączenia z bazą danych", err.stack);
  } else {
    console.log("Połączenie z bazą danych");
  }
});

async function clearTables() {
    try {
      await pool.query('TRUNCATE TABLE sessions RESTART IDENTITY');
      console.log('Sesje wyczyszczone');
    } catch (err) {
      console.error('Błąd czyszczenia tabel:', err);
    }
  }
  
  

module.exports = { pool, clearTables };
