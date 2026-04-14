import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, eventType, eventData } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    await pool.query(
      `INSERT INTO quiz_events (session_id, event_type, event_data, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [sessionId, eventType, JSON.stringify(eventData || {})]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/event] Error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
