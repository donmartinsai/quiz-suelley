import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const utmSource = searchParams.get("utm_source")
    const resultPhase = searchParams.get("result_phase")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

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

    if (startDate) {
      conditions.push(`start_at >= $${paramIndex++}`)
      params.push(startDate)
    }

    if (endDate) {
      conditions.push(`start_at <= $${paramIndex++}`)
      params.push(endDate + " 23:59:59")
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const result = await pool.query(
      `SELECT 
        start_at,
        first_name,
        email,
        whatsapp,
        completed,
        last_question_seen,
        result_phase,
        checkout_clicked,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        device
      FROM quiz_sessions
      ${whereClause}
      ORDER BY start_at DESC`,
      params
    )

    // Build CSV
    const headers = [
      "Data",
      "Nome",
      "Email",
      "WhatsApp",
      "Completou",
      "Ultima Pergunta",
      "Fase Resultado",
      "Checkout",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "UTM Content",
      "Device",
    ]

    const rows = result.rows.map((row) => [
      row.start_at ? new Date(row.start_at).toLocaleString("pt-BR") : "",
      row.first_name || "",
      row.email || "",
      row.whatsapp || "",
      row.completed ? "Sim" : "Nao",
      row.last_question_seen || "",
      row.result_phase || "",
      row.checkout_clicked ? "Sim" : "Nao",
      row.utm_source || "",
      row.utm_medium || "",
      row.utm_campaign || "",
      row.utm_content || "",
      row.device || "",
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
