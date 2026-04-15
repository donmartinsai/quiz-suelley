import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status") // completed | abandoned
    const utmSource = searchParams.get("utm_source")
    const resultPhase = searchParams.get("result_phase")
    const ageRange = searchParams.get("age_range")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    const offset = (page - 1) * limit
    const conditions: string[] = []
    const params: (string | number)[] = []
    let paramIndex = 1

    if (status === "completed") {
      conditions.push(`completed = true`)
    } else if (status === "abandoned") {
      conditions.push(`completed = false`)
    }

    if (utmSource) {
      conditions.push(`utm_source = $${paramIndex++}`)
      params.push(utmSource)
    }

    if (resultPhase) {
      conditions.push(`result_phase = $${paramIndex++}`)
      params.push(resultPhase)
    }

    if (ageRange) {
      conditions.push(`age_range = $${paramIndex++}`)
      params.push(ageRange)
    }

    if (startDate) {
      conditions.push(`start_at >= $${paramIndex++}`)
      params.push(startDate)
    }

    if (endDate) {
      conditions.push(`start_at <= $${paramIndex++}`)
      params.push(endDate + " 23:59:59")
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Get paginated results
    const result = await pool.query(
      `SELECT 
        id,
        start_at,
        first_name,
        email,
        whatsapp,
        age_range,
        completed,
        last_question_seen,
        result_phase,
        checkout_clicked,
        utm_source,
        utm_campaign
      FROM quiz_sessions
      ${whereClause}
      ORDER BY start_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    )

    const leads = result.rows.map((row) => ({
      id: row.id,
      startAt: row.start_at,
      firstName: row.first_name,
      email: row.email,
      whatsapp: row.whatsapp,
      ageRange: row.age_range || null,
      completed: row.completed,
      lastQuestionSeen: row.last_question_seen,
      resultPhase: row.result_phase,
      checkoutClicked: row.checkout_clicked,
      utmSource: row.utm_source,
      utmCampaign: row.utm_campaign,
    }))

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Leads error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
