import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    await pool.query(
      `UPDATE quiz_sessions 
       SET checkout_clicked = true, last_seen_at = NOW()
       WHERE id = $1`,
      [sessionId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/checkout] Error:", error)
    return NextResponse.json({ error: "Failed to track checkout" }, { status: 500 })
  }
}
