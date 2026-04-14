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
        <div className="text-[#6B5A6E]">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#710C60]">Distribuição de Respostas</h1>

      <div className="grid gap-4">
        {questions.map((question, qIdx) => (
          <Card key={question.id} className="bg-white border-[#F0E8DF] shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-[#EF709D] mb-1 block">
                    Pergunta {qIdx + 1}
                  </span>
                  <CardTitle className="text-[#2A1F30] text-base font-medium leading-tight">
                    {question.text}
                  </CardTitle>
                </div>
                <span className="text-xs text-[#6B5A6E] whitespace-nowrap">
                  {question.totalResponses} respostas
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, optIdx) => (
                <div key={optIdx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={optIdx === question.mostChosen ? "text-[#710C60] font-medium" : "text-[#2A1F30]"}>
                      {option.text}
                      {optIdx === question.mostChosen && (
                        <span className="ml-2 text-xs text-[#EF709D]">mais escolhida</span>
                      )}
                    </span>
                    <span className="text-[#6B5A6E] text-xs">
                      {option.count} ({option.pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#F0E8DF] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${option.pct}%`,
                        backgroundColor: optIdx === question.mostChosen ? "#EF709D" : "#6B5A6E"
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
