import { NextResponse } from "next/server"
import pool from "@/lib/db"

const AGE_LABELS: Record<string, string> = {
  "ate-35": "Até 35",
  "36-45": "36 a 45",
  "46-55": "46 a 55",
  "56+": "56 ou mais",
}

export async function GET() {
  try {
    // Count leads grouped by age_range
    const result = await pool.query(`
      SELECT 
        age_range,
        COUNT(*) as count
      FROM quiz_sessions
      WHERE age_range IS NOT NULL AND age_range != ''
      GROUP BY age_range
      ORDER BY count DESC
    `)

    // Get total leads with age_range
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM quiz_sessions 
      WHERE age_range IS NOT NULL AND age_range != ''
    `)

    const total = parseInt(totalResult.rows[0]?.total || "0")

    const distribution = result.rows.map((row) => ({
      ageRange: row.age_range,
      label: AGE_LABELS[row.age_range] || row.age_range,
      count: parseInt(row.count),
      percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0,
    }))

    return NextResponse.json({
      total,
      distribution,
    })
  } catch (error) {
    console.error("[age-distribution] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
