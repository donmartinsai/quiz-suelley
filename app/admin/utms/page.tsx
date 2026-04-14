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
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Análise de UTMs</h1>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-neutral-400 text-sm">Desempenho por Fonte de Tráfego</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-neutral-800/50">
                <TableHead className="text-neutral-400">Source</TableHead>
                <TableHead className="text-neutral-400">Campaign</TableHead>
                <TableHead className="text-neutral-400 text-right">Sessões</TableHead>
                <TableHead className="text-neutral-400 text-right">Completaram</TableHead>
                <TableHead className="text-neutral-400 text-right">Checkout</TableHead>
                <TableHead className="text-neutral-400 text-right">Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-500 py-8">
                    Nenhum dado de UTM encontrado
                  </TableCell>
                </TableRow>
              ) : (
                utms.map((utm, idx) => (
                  <TableRow key={idx} className="border-neutral-800 hover:bg-neutral-800/50">
                    <TableCell className="text-white font-medium">{utm.source}</TableCell>
                    <TableCell className="text-neutral-300">{utm.campaign}</TableCell>
                    <TableCell className="text-neutral-300 text-right">{utm.sessions}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-[#EF709D]">{utm.completed}</span>
                      <span className="text-neutral-500 text-xs ml-1">({utm.completedPct}%)</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[#710C60]">{utm.checkout}</span>
                      <span className="text-neutral-500 text-xs ml-1">({utm.checkoutPct}%)</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-white">{utm.leads}</span>
                      <span className="text-neutral-500 text-xs ml-1">({utm.leadsPct}%)</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {utms.length > 0 && (
        <p className="text-xs text-neutral-500">
          Ordenado por taxa de conversão (completaram / sessões). Taxas de checkout calculadas sobre sessões completadas.
        </p>
      )}
    </div>
  )
}
