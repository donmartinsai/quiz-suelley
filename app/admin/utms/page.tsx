"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UTMData {
  source: string
  campaign: string
  sessions: number
  completed: number
  completedPct: number
  checkout: number
  checkoutPct: number
  leads: number
  leadsPct: number
}

export default function AdminUtmsPage() {
  const [utms, setUtms] = useState<UTMData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/utms")
        const data = await res.json()
        setUtms(data.utms || [])
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
      <h1 className="text-2xl font-bold text-[#710C60]">Análise de UTMs</h1>

      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#6B5A6E] text-sm">Desempenho por Fonte de Tráfego</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#F0E8DF] hover:bg-[#FDF8F4]">
                <TableHead className="text-[#6B5A6E]">Source</TableHead>
                <TableHead className="text-[#6B5A6E]">Campaign</TableHead>
                <TableHead className="text-[#6B5A6E] text-right">Sessões</TableHead>
                <TableHead className="text-[#6B5A6E] text-right">Completaram</TableHead>
                <TableHead className="text-[#6B5A6E] text-right">Checkout</TableHead>
                <TableHead className="text-[#6B5A6E] text-right">Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#6B5A6E] py-8">
                    Nenhum dado de UTM encontrado
                  </TableCell>
                </TableRow>
              ) : (
                utms.map((utm, idx) => (
                  <TableRow key={idx} className="border-[#F0E8DF] hover:bg-[#FDF8F4]">
                    <TableCell className="text-[#2A1F30] font-medium">{utm.source}</TableCell>
                    <TableCell className="text-[#6B5A6E]">{utm.campaign}</TableCell>
                    <TableCell className="text-[#6B5A6E] text-right">{utm.sessions}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-[#EF709D] font-medium">{utm.completed}</span>
                      <span className="text-[#6B5A6E] text-xs ml-1">({utm.completedPct}%)</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[#CA3716] font-medium">{utm.checkout}</span>
                      <span className="text-[#6B5A6E] text-xs ml-1">({utm.checkoutPct}%)</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[#710C60] font-medium">{utm.leads}</span>
                      <span className="text-[#6B5A6E] text-xs ml-1">({utm.leadsPct}%)</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {utms.length > 0 && (
        <p className="text-xs text-[#6B5A6E]">
          Ordenado por taxa de conversão (completaram / sessões). Taxas de checkout calculadas sobre sessões completadas.
        </p>
      )}
    </div>
  )
}
