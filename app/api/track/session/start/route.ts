import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { utm_source, utm_medium, utm_campaign, utm_content, device, user_agent } = body

    const sessionId = uuidv4()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || null

    await pool.query(
      `INSERT INTO quiz_sessions 
        (id, start_at, utm_source, utm_medium, utm_campaign, utm_content, device, user_agent, ip_address)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, utm_source, utm_medium, utm_campaign, utm_content, device, user_agent, ip]
    )

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("[track/session/start] Error:", error)
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 })
  }
}
