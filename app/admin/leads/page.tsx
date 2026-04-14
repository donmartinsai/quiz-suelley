"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { getPhaseLabel } from "@/lib/phase-labels"

interface Lead {
  id: string
  startAt: string
  firstName: string | null
  email: string | null
  whatsapp: string | null
  completed: boolean
  lastQuestionSeen: number | null
  resultPhase: string | null
  checkoutClicked: boolean
  utmSource: string | null
  utmCampaign: string | null
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [status, setStatus] = useState<string>("")
  const [utmSource, setUtmSource] = useState("")
  const [resultPhase, setResultPhase] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function fetchLeads() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "50")
      if (status) params.set("status", status)
      if (utmSource) params.set("utm_source", utmSource)
      if (resultPhase) params.set("result_phase", resultPhase)
      if (startDate) params.set("start_date", startDate)
      if (endDate) params.set("end_date", endDate)

      const res = await fetch(`/api/admin/leads?${params.toString()}`)
      const data = await res.json()

      setLeads(data.leads || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [page, status, utmSource, resultPhase, startDate, endDate])

  function handleExport() {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (utmSource) params.set("utm_source", utmSource)
    if (resultPhase) params.set("result_phase", resultPhase)
    if (startDate) params.set("start_date", startDate)
    if (endDate) params.set("end_date", endDate)

    window.open(`/api/admin/leads/export?${params.toString()}`, "_blank")
  }

  function getStatusBadge(lead: Lead) {
    if (lead.completed) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Completou</Badge>
    }
    if (lead.lastQuestionSeen) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Parou na Q{lead.lastQuestionSeen}</Badge>
    }
    return <Badge className="bg-red-100 text-red-700 border-red-200">Abandonou</Badge>
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#710C60]">Leads</h1>
        <Button onClick={handleExport} variant="outline" className="border-[#F0E8DF] text-[#6B5A6E] hover:bg-[#F0E8DF] hover:text-[#710C60]">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-[#6B5A6E]">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#F0E8DF] text-[#2A1F30]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#F0E8DF]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completaram</SelectItem>
                <SelectItem value="abandoned">Abandonaram</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="UTM Source"
              value={utmSource}
              onChange={(e) => { setUtmSource(e.target.value); setPage(1) }}
              className="bg-white border-[#F0E8DF] text-[#2A1F30] placeholder:text-[#6B5A6E]"
            />

            <Select value={resultPhase} onValueChange={(v) => { setResultPhase(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#F0E8DF] text-[#2A1F30]">
                <SelectValue placeholder="Fase Resultado" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#F0E8DF]">
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="fase_inicial">Fase Inicial</SelectItem>
                <SelectItem value="alerta_hormonal">Alerta Hormonal</SelectItem>
                <SelectItem value="acao_urgente">Ação Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="bg-white border-[#F0E8DF] text-[#2A1F30]"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="bg-white border-[#F0E8DF] text-[#2A1F30]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#F0E8DF] hover:bg-[#FDF8F4]">
                <TableHead className="text-[#6B5A6E]">Data</TableHead>
                <TableHead className="text-[#6B5A6E]">Nome</TableHead>
                <TableHead className="text-[#6B5A6E]">Email</TableHead>
                <TableHead className="text-[#6B5A6E]">Status</TableHead>
                <TableHead className="text-[#6B5A6E]">Fase</TableHead>
                <TableHead className="text-[#6B5A6E]">Checkout</TableHead>
                <TableHead className="text-[#6B5A6E]">UTM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#6B5A6E] py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#6B5A6E] py-8">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="border-[#F0E8DF] hover:bg-[#FDF8F4]">
                    <TableCell className="text-[#6B5A6E] text-sm">{formatDate(lead.startAt)}</TableCell>
                    <TableCell className="text-[#2A1F30] font-medium">{lead.firstName || "-"}</TableCell>
                    <TableCell className="text-[#6B5A6E] text-sm">{lead.email || "-"}</TableCell>
                    <TableCell>{getStatusBadge(lead)}</TableCell>
                    <TableCell className="text-[#6B5A6E] text-sm">{getPhaseLabel(lead.resultPhase)}</TableCell>
                    <TableCell>
                      {lead.checkoutClicked ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-[#F0E8DF]" />
                      )}
                    </TableCell>
                    <TableCell className="text-[#6B5A6E] text-xs">
                      {lead.utmSource || "direto"}
                      {lead.utmCampaign && ` / ${lead.utmCampaign}`}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B5A6E]">
          Mostrando {leads.length} de {total} leads
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-[#F0E8DF] text-[#6B5A6E] hover:bg-[#F0E8DF] disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-[#6B5A6E] text-sm">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-[#F0E8DF] text-[#6B5A6E] hover:bg-[#F0E8DF] disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
