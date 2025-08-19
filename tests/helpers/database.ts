import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "~/db/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create test database connection without strict env validation
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_TEST,
});

export const testDatabase = drizzle(pool, { schema });

export async function closeTestDatabase() {
  await pool.end();
}
