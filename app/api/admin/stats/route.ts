import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Total sessions
    const totalSessions = await pool.query(`SELECT COUNT(*) as count FROM quiz_sessions`)
    
    // Sessions today
    const sessionsToday = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE start_at >= CURRENT_DATE`
    )
    
    // Sessions last 7 days
    const sessions7d = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE start_at >= CURRENT_DATE - INTERVAL '7 days'`
    )
    
    // Completed sessions
    const completed = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE completed = true`
    )
    
    // Checkout clicked
    const checkoutClicked = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE checkout_clicked = true`
    )
    
    // Leads captured (has email or whatsapp)
    const leads = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE email IS NOT NULL OR whatsapp IS NOT NULL`
    )

    const total = parseInt(totalSessions.rows[0].count)
    const completedCount = parseInt(completed.rows[0].count)
    const checkoutCount = parseInt(checkoutClicked.rows[0].count)

    return NextResponse.json({
      totalSessions: total,
      sessionsToday: parseInt(sessionsToday.rows[0].count),
      sessions7d: parseInt(sessions7d.rows[0].count),
      completed: completedCount,
      completionRate: total > 0 ? ((completedCount / total) * 100).toFixed(1) : 0,
      checkoutClicked: checkoutCount,
      checkoutRate: completedCount > 0 ? ((checkoutCount / completedCount) * 100).toFixed(1) : 0,
      leads: parseInt(leads.rows[0].count),
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
