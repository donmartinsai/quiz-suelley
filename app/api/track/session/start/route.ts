import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json().catch(() => ({}))
    const { utm_source, utm_medium, utm_campaign, utm_content, device, user_agent } = body

    const sessionId = uuidv4()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || null

    console.log("[track/session/start] Creating session:", {
      sessionId,
      utm_source,
      utm_medium,
      utm_campaign,
      ip: ip?.substring(0, 10) + "...",
    })

    await pool.query(
      `INSERT INTO quiz_sessions 
        (id, start_at, utm_source, utm_medium, utm_campaign, utm_content, device, user_agent, ip_address)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, utm_source || null, utm_medium || null, utm_campaign || null, utm_content || null, device || null, user_agent || null, ip]
    )

    const responseTime = Date.now() - startTime
    console.log("[track/session/start] Session created successfully:", { sessionId, responseTimeMs: responseTime })

    return NextResponse.json({ sessionId })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    // Log detailed error information
    console.error("[track/session/start] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
      detail: (error as { detail?: string })?.detail,
      table: (error as { table?: string })?.table,
      constraint: (error as { constraint?: string })?.constraint,
      responseTimeMs: responseTime,
    })
    
    // Full stack trace
    if (error instanceof Error) {
      console.error("[track/session/start] Stack trace:", error.stack)
    }

    return NextResponse.json(
      { 
        error: "Failed to start session",
        debug: process.env.NODE_ENV === "development" ? {
          message: error instanceof Error ? error.message : String(error),
          code: (error as { code?: string })?.code,
        } : undefined
      }, 
      { status: 500 }
    )
  }
}
