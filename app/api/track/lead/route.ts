import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, email, whatsapp, firstName, ageRange } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    // Validate ageRange if provided
    let validAgeRange: string | null = null
    if (ageRange && typeof ageRange === "string") {
      validAgeRange = ageRange.slice(0, 20) // Max 20 chars
    } else if (ageRange) {
      console.warn("[track/lead] ageRange missing or invalid, continuing without it:", { sessionId, ageRange })
    }

    await pool.query(
      `UPDATE quiz_sessions 
       SET email = $2, whatsapp = $3, first_name = $4, age_range = $5, last_seen_at = NOW()
       WHERE id = $1`,
      [sessionId, email, whatsapp, firstName, validAgeRange]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[track/lead] Error:", error)
    return NextResponse.json({ error: "Failed to track lead" }, { status: 500 })
  }
}
