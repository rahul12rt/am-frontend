// db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  // ssl: { rejectUnauthorized: false } // Uncomment for hosted DBs with SSL
});

const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");
    client.release(); // release back to pool
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1); // exit the app if DB fails
  }
};

module.exports = {
  pool,
  initDb,
};
