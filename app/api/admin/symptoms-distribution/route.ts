import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { Q2_SYMPTOMS } from "@/lib/phase-labels"

export async function GET() {
  try {
    // Get ALL Q2 answers (not grouped)
    const answersResult = await pool.query(`
      SELECT answer, session_id
      FROM quiz_answers
      WHERE question_id = 'e2'
    `)

    // Aggregate counts per individual index
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const uniqueSessions = new Set<string>()

    for (const row of answersResult.rows) {
      uniqueSessions.add(row.session_id)
      try {
        // Parse answer: "[0,1,2]" -> [0,1,2]
        const indices = JSON.parse(row.answer)
        if (Array.isArray(indices)) {
          for (const idx of indices) {
            if (typeof idx === "number" && counts[idx] !== undefined) {
              counts[idx]++
            }
          }
        }
      } catch {
        // Malformed answer, skip
      }
    }

    const total = uniqueSessions.size

    // Build distribution array with labels and percentages
    const distribution = Object.entries(counts)
      .map(([idx, count]) => {
        const index = `[${idx}]`
        const symptomInfo = Q2_SYMPTOMS[index] || { icon: "?", label: `Opção ${idx}` }
        const percentage = total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0

        return {
          index,
          icon: symptomInfo.icon,
          label: symptomInfo.label,
          count,
          percentage
        }
      })
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total,
      distribution
    })
  } catch (error) {
    console.error("Error fetching symptoms distribution:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
