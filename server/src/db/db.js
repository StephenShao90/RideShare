import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const requiredEnvVars = [
  "DB_USER",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function testDbConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT NOW() AS now");
    console.log("Connected to PostgreSQL at:", result.rows[0].now);
  } finally {
    client.release();
  }
}

export default pool;