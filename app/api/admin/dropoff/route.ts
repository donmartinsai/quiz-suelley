import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Get count of sessions that stopped at each question
    const result = await pool.query(`
      SELECT 
        last_question_seen,
        COUNT(*) as count
      FROM quiz_sessions
      WHERE completed = false AND last_question_seen IS NOT NULL
      GROUP BY last_question_seen
      ORDER BY last_question_seen
    `)

    // Total incomplete sessions
    const totalIncomplete = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE completed = false`
    )
    const total = parseInt(totalIncomplete.rows[0].count)

    const dropoff = []
    for (let i = 1; i <= 11; i++) {
      const row = result.rows.find((r) => r.last_question_seen === i)
      const count = row ? parseInt(row.count) : 0
      dropoff.push({
        question: i,
        count,
        pct: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      })
    }

    return NextResponse.json({ dropoff, totalIncomplete: total })
  } catch (error) {
    console.error("Dropoff error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
