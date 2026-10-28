import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`GenZineer API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start GenZineer:", error.message);
    process.exitCode = 1;
  }
}

startServer();
