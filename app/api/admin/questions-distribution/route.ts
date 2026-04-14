import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Question config from quiz (hardcoded for admin display)
const questionsConfig = [
  { id: "e1", text: "Os sintomas que você sente começaram de repente ou foram aparecendo aos poucos?", options: ["Foram aparecendo aos poucos", "Não, já vinha percebendo...", "Parece que sempre tive algo"] },
  { id: "e2", text: "Você sabia que a perimenopausa pode começar até 10 anos antes da menopausa?", options: ["Sim, já sabia disso", "Não, isso é novidade pra mim"] },
  { id: "e3", text: "Quando você pensa na sua menstruação, como ela está hoje?", options: ["Regular como sempre", "Irregular ou mudando", "Parou completamente"] },
  { id: "e4", text: "Em relação ao seu corpo, o que mais te incomoda?", options: ["Ondas de calor", "Ganho de peso / inchaço", "Cansaço constante", "Nenhum desses"] },
  { id: "e5", text: "Alguma dessas frases se encaixa na sua experiência?", options: ["Me sinto mais ansiosa do que antes", "Choro fácil sem motivo aparente", "Perdi interesse em coisas que gostava", "Nenhuma dessas"] },
  { id: "e6", text: "Quais desses sintomas você identificou em você?", options: ["Fogachos / suores noturnos", "Irritabilidade / choro fácil", "Ressecamento vaginal", "Queda de libido", "Ganho de peso abdominal", "Nenhum ou poucos sintomas"] },
  { id: "e7", text: "Como esses sintomas estão impactando sua vida?", options: ["Estão afetando meu trabalho", "Meus relacionamentos estão sofrendo", "Minha autoestima caiu muito", "Aumento dos riscos de saúde", "Ainda não impactou muito"] },
  { id: "e8", text: "Como está seu sono?", options: ["Acordo de madrugada", "Tenho dificuldade de pegar no sono", "Durmo bem mas acordo cansada", "Meu sono está normal"] },
  { id: "e9", text: "Veja como os hormônios mudam ao longo da vida da mulher", options: ["Entendi, quero saber mais", "Não sabia que era assim"] },
  { id: "e10", text: "O que você mais gostaria de conquistar agora?", options: ["Ter mais energia e disposição", "Dormir bem de novo", "Entender o que está acontecendo", "Ter de volta a minha libido", "Emagrecer com saúde"] },
  { id: "e11", text: "O que te impediu de buscar ajuda antes?", options: ["Não sabia que existia solução", "Médicos não me ouviam", "Achava que era normal"] },
]

export async function GET() {
  try {
    const distribution = []

    for (const question of questionsConfig) {
      // Get all answers for this question
      const result = await pool.query(
        `SELECT answer_indexes FROM quiz_answers WHERE question_id = $1`,
        [question.id]
      )

      const optionCounts: Record<number, number> = {}
      question.options.forEach((_, idx) => {
        optionCounts[idx] = 0
      })

      let totalResponses = 0
      for (const row of result.rows) {
        const indexes = row.answer_indexes as number[]
        for (const idx of indexes) {
          if (optionCounts[idx] !== undefined) {
            optionCounts[idx]++
          }
        }
        totalResponses++
      }

      const options = question.options.map((text, idx) => ({
        text,
        count: optionCounts[idx],
        pct: totalResponses > 0 ? parseFloat(((optionCounts[idx] / totalResponses) * 100).toFixed(1)) : 0,
      }))

      // Find most chosen
      const maxCount = Math.max(...options.map((o) => o.count))
      const mostChosen = options.findIndex((o) => o.count === maxCount)

      distribution.push({
        id: question.id,
        text: question.text,
        totalResponses,
        options,
        mostChosen,
      })
    }

    return NextResponse.json({ questions: distribution })
  } catch (error) {
    console.error("Questions distribution error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
