import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Total sessions started
    const totalResult = await pool.query(`SELECT COUNT(*) as count FROM quiz_sessions`)
    const total = parseInt(totalResult.rows[0].count)

    if (total === 0) {
      return NextResponse.json({ funnel: [], total: 0 })
    }

    // Questions answered (count sessions that reached each question)
    const questionsResult = await pool.query(`
      SELECT 
        last_question_seen,
        COUNT(*) as count
      FROM quiz_sessions
      WHERE last_question_seen IS NOT NULL
      GROUP BY last_question_seen
      ORDER BY last_question_seen
    `)

    // Build cumulative counts (sessions that reached at least question N)
    const questionCounts: Record<number, number> = {}
    for (let i = 1; i <= 11; i++) {
      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM quiz_sessions WHERE last_question_seen >= $1`,
        [i]
      )
      questionCounts[i] = parseInt(countResult.rows[0].count)
    }

    // Email captured
    const emailResult = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE email IS NOT NULL`
    )
    const emailCount = parseInt(emailResult.rows[0].count)

    // Completed (reached result)
    const completedResult = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE completed = true`
    )
    const completedCount = parseInt(completedResult.rows[0].count)

    // Checkout clicked
    const checkoutResult = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_sessions WHERE checkout_clicked = true`
    )
    const checkoutCount = parseInt(checkoutResult.rows[0].count)

    const funnel = [
      { step: "Iniciaram quiz", count: total, pct: 100 },
    ]

    for (let i = 1; i <= 11; i++) {
      funnel.push({
        step: `Pergunta ${i}`,
        count: questionCounts[i],
        pct: parseFloat(((questionCounts[i] / total) * 100).toFixed(1)),
      })
    }

    funnel.push(
      { step: "Informaram email", count: emailCount, pct: parseFloat(((emailCount / total) * 100).toFixed(1)) },
      { step: "Chegaram no resultado", count: completedCount, pct: parseFloat(((completedCount / total) * 100).toFixed(1)) },
      { step: "Clicaram checkout", count: checkoutCount, pct: parseFloat(((checkoutCount / total) * 100).toFixed(1)) }
    )

    return NextResponse.json({ funnel, total })
  } catch (error) {
    console.error("Funnel error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
