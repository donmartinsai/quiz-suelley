import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, resultPhase } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    await pool.query(
      `UPDATE quiz_sessions 
       SET completed = true, end_at = NOW(), result_phase = $2
       WHERE id = $1`,
      [sessionId, resultPhase]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/complete] Error:", error)
    return NextResponse.json({ error: "Failed to track completion" }, { status: 500 })
  }
}
