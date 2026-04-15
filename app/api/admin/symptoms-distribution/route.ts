import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { Q2_SYMPTOMS } from "@/lib/phase-labels"

export async function GET() {
  // Auth check
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get distribution of Q2 answers
    const distributionResult = await sql`
      SELECT 
        answer,
        COUNT(*) as count,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM quiz_answers
      WHERE question_id = 'e2'
      GROUP BY answer
      ORDER BY count DESC
    `

    // Get total sessions that answered Q2
    const totalResult = await sql`
      SELECT COUNT(DISTINCT session_id) as total
      FROM quiz_answers
      WHERE question_id = 'e2'
    `

    const total = Number(totalResult[0]?.total) || 0

    // Build distribution array with labels and percentages
    const distribution = distributionResult.map((row) => {
      const index = row.answer as string
      const symptomInfo = Q2_SYMPTOMS[index] || { icon: "?", label: `Opção ${index}` }
      const count = Number(row.count)
      const percentage = total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0

      return {
        index,
        icon: symptomInfo.icon,
        label: symptomInfo.label,
        count,
        percentage
      }
    })

    // Sort by count descending
    distribution.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total,
      distribution
    })
  } catch (error) {
    console.error("Error fetching symptoms distribution:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
