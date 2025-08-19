import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function globalTeardown() {
  console.log("🧹 Cleaning up test database connections...");
  
  // Create a connection to close any remaining connections
  const connectionString = process.env.DATABASE_URL_TEST || "postgresql://postgres:example@localhost:5433/postgres";
  
  const pool = new pg.Pool({
    connectionString,
  });
  
  try {
    // Optionally, you can clear the database here as well
    // But it's better to do it in setup to ensure clean state
    
    console.log("✅ Test database teardown complete!");
  } catch (error) {
    console.error("❌ Error during teardown:", error);
  } finally {
    await pool.end();
  }
}

export default globalTeardown;