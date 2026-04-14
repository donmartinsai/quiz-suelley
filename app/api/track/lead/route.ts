import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, email, whatsapp, firstName } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    await pool.query(
      `UPDATE quiz_sessions 
       SET email = $2, whatsapp = $3, first_name = $4, last_seen_at = NOW()
       WHERE id = $1`,
      [sessionId, email, whatsapp, firstName]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/lead] Error:", error)
    return NextResponse.json({ error: "Failed to track lead" }, { status: 500 })
  }
}
