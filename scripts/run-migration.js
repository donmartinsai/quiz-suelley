import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { Pool } = pg

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log("Connecting to database...")
    
    // Test connection
    const testResult = await pool.query("SELECT NOW() as now")
    console.log("Connected! Server time:", testResult.rows[0].now)

    // Read and execute migration
    const sqlPath = path.join(__dirname, "001_create_tables.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")
    
    console.log("Running migration...")
    await pool.query(sql)
    console.log("Migration completed successfully!")

    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('quiz_sessions', 'quiz_answers', 'quiz_events')
    `)
    
    console.log("Tables created:", tablesResult.rows.map(r => r.table_name))

  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
