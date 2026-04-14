import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, questionOrder } = body

    if (!sessionId || typeof questionOrder !== "number") {
      return NextResponse.json({ error: "Missing sessionId or questionOrder" }, { status: 400 })
    }

    // Update session last_question_seen (use GREATEST to never decrease)
    await pool.query(
      `UPDATE quiz_sessions 
       SET last_question_seen = GREATEST(last_question_seen, $2), last_seen_at = NOW()
       WHERE id = $1`,
      [sessionId, questionOrder]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/progress] Error:", error)
    return NextResponse.json({ error: "Failed to track progress" }, { status: 500 })
  }
}
