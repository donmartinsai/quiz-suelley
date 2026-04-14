"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QuestionOption {
  text: string
  count: number
  pct: number
}

interface Question {
  id: string
  text: string
  totalResponses: number
  options: QuestionOption[]
  mostChosen: number
}

export default function AdminRespostasPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/questions-distribution")
        const data = await res.json()
        setQuestions(data.questions || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Distribuição de Respostas</h1>

      <div className="grid gap-4">
        {questions.map((question, qIdx) => (
          <Card key={question.id} className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-[#EF709D] mb-1 block">
                    Pergunta {qIdx + 1}
                  </span>
                  <CardTitle className="text-white text-base font-medium leading-tight">
                    {question.text}
                  </CardTitle>
                </div>
                <span className="text-xs text-neutral-500 whitespace-nowrap">
                  {question.totalResponses} respostas
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, optIdx) => (
                <div key={optIdx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={optIdx === question.mostChosen ? "text-[#EF709D] font-medium" : "text-neutral-300"}>
                      {option.text}
                      {optIdx === question.mostChosen && (
                        <span className="ml-2 text-xs text-[#EF709D]">★ mais escolhida</span>
                      )}
                    </span>
                    <span className="text-neutral-400 text-xs">
                      {option.count} ({option.pct}%)
                    </span>
                  </div>
                  <Progress
                    value={option.pct}
                    className="h-2 bg-neutral-800"
                    style={{
                      // @ts-expect-error custom CSS variable
                      "--progress-foreground": optIdx === question.mostChosen ? "#EF709D" : "#666",
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
