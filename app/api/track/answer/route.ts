import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, questionId, questionOrder, answer } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    // Insert answer
    await pool.query(
      `INSERT INTO quiz_answers (session_id, question_id, question_order, answer, answered_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [sessionId, questionId, questionOrder, JSON.stringify(answer)]
    )

    // Update session last_question_seen (use GREATEST to never decrease)
    await pool.query(
      `UPDATE quiz_sessions 
       SET last_question_seen = GREATEST(last_question_seen, $2), last_seen_at = NOW()
       WHERE id = $1`,
      [sessionId, questionOrder]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/answer] Error:", error)
    return NextResponse.json({ error: "Failed to track answer" }, { status: 500 })
  }
}
