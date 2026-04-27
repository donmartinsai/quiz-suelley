import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test database connection
    const connectionTest = await pool.query("SELECT NOW() as server_time")
    
    // Check if quiz_sessions table exists and get last insert
    const tableCheck = await pool.query(`
      SELECT 
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'quiz_sessions'
        ) as sessions_exists,
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'quiz_answers'
        ) as answers_exists,
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'quiz_events'
        ) as events_exists
    `)
    
    // Get last session timestamp if table exists
    let lastSession = null
    let totalSessions = 0
    
    if (tableCheck.rows[0].sessions_exists) {
      const lastSessionResult = await pool.query(`
        SELECT start_at FROM quiz_sessions 
        ORDER BY start_at DESC 
        LIMIT 1
      `)
      lastSession = lastSessionResult.rows[0]?.start_at || null
      
      const countResult = await pool.query("SELECT COUNT(*) as count FROM quiz_sessions")
      totalSessions = parseInt(countResult.rows[0].count, 10)
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        serverTime: connectionTest.rows[0].server_time,
        responseTimeMs: responseTime,
        tables: {
          quiz_sessions: tableCheck.rows[0].sessions_exists,
          quiz_answers: tableCheck.rows[0].answers_exists,
          quiz_events: tableCheck.rows[0].events_exists,
        },
        stats: {
          totalSessions,
          lastSessionAt: lastSession,
        },
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("[health] Database check failed:", error)
    
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          responseTimeMs: responseTime,
        },
      },
      { status: 503 }
    )
  }
}
