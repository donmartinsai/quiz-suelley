import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  console.error("[db] DATABASE_URL environment variable is not set")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Connection pool settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Log pool errors
pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message)
})

// Log when pool connects
pool.on("connect", () => {
  console.log("[db] New client connected to pool")
})

export default pool
