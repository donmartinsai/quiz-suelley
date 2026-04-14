import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")

    const result = await pool.query(`
      SELECT 
        DATE(start_at) as date,
        COUNT(*) as iniciados,
        COUNT(*) FILTER (WHERE completed = true) as completados,
        COUNT(*) FILTER (WHERE checkout_clicked = true) as checkout
      FROM quiz_sessions
      WHERE start_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(start_at)
      ORDER BY date
    `)

    const timeline = result.rows.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      iniciados: parseInt(row.iniciados),
      completados: parseInt(row.completados),
      checkout: parseInt(row.checkout),
    }))

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error("Timeline error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
