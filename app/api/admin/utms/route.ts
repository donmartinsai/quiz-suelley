import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(utm_source, 'direto') as source,
        COALESCE(utm_campaign, '-') as campaign,
        COUNT(*) as sessions,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE checkout_clicked = true) as checkout,
        COUNT(*) FILTER (WHERE email IS NOT NULL OR whatsapp IS NOT NULL) as leads
      FROM quiz_sessions
      GROUP BY COALESCE(utm_source, 'direto'), COALESCE(utm_campaign, '-')
      ORDER BY COUNT(*) FILTER (WHERE completed = true)::float / NULLIF(COUNT(*), 0) DESC NULLS LAST
    `)

    const utms = result.rows.map((row) => ({
      source: row.source,
      campaign: row.campaign,
      sessions: parseInt(row.sessions),
      completed: parseInt(row.completed),
      completedPct: parseInt(row.sessions) > 0 ? parseFloat(((parseInt(row.completed) / parseInt(row.sessions)) * 100).toFixed(1)) : 0,
      checkout: parseInt(row.checkout),
      checkoutPct: parseInt(row.completed) > 0 ? parseFloat(((parseInt(row.checkout) / parseInt(row.completed)) * 100).toFixed(1)) : 0,
      leads: parseInt(row.leads),
      leadsPct: parseInt(row.sessions) > 0 ? parseFloat(((parseInt(row.leads) / parseInt(row.sessions)) * 100).toFixed(1)) : 0,
    }))

    return NextResponse.json({ utms })
  } catch (error) {
    console.error("UTMs error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
