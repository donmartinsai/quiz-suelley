"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"

interface Stats {
  totalSessions: number
  sessionsToday: number
  sessions7d: number
  completed: number
  completionRate: string | number
  checkoutClicked: number
  checkoutRate: string | number
  leads: number
}

interface FunnelStep {
  step: string
  count: number
  pct: number
}

interface DropoffItem {
  question: number
  count: number
  pct: number
}

interface TimelineItem {
  date: string
  iniciados: number
  completados: number
  checkout: number
}

interface SymptomsDistributionItem {
  index: string
  icon: string
  label: string
  count: number
  percentage: number
}

interface SymptomsDistribution {
  total: number
  distribution: SymptomsDistributionItem[]
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [dropoff, setDropoff] = useState<DropoffItem[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [symptoms, setSymptoms] = useState<SymptomsDistribution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, funnelRes, dropoffRes, timelineRes, symptomsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/funnel"),
          fetch("/api/admin/dropoff"),
          fetch("/api/admin/timeline?days=30"),
          fetch("/api/admin/symptoms-distribution"),
        ])

        const statsData = await statsRes.json()
        const funnelData = await funnelRes.json()
        const dropoffData = await dropoffRes.json()
        const timelineData = await timelineRes.json()
        
        // Handle symptoms response gracefully
        let symptomsData = { total: 0, distribution: [] }
        if (symptomsRes.ok) {
          symptomsData = await symptomsRes.json()
        }

        setStats(statsData)
        setFunnel(funnelData.funnel || [])
        setDropoff(dropoffData.dropoff || [])
        setTimeline(timelineData.timeline || [])
        setSymptoms(symptomsData)
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

  // Custom label renderer for funnel bars
  const renderFunnelLabel = (props: { x?: number; y?: number; width?: number; height?: number; value?: number; payload?: FunnelStep }) => {
    const { x = 0, y = 0, width = 0, height = 0, payload } = props
    if (!payload) return null
    return (
      <text
        x={x + width + 8}
        y={y + height / 2}
        fill="#2A1F30"
        fontSize={12}
        fontWeight={500}
        dominantBaseline="middle"
      >
        {payload.count} ({payload.pct}%)
      </text>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#710C60]">Overview</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#F0E8DF] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5A6E]">Sessões Iniciadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#710C60]">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-[#6B5A6E]">
              Hoje: {stats?.sessionsToday || 0} | 7 dias: {stats?.sessions7d || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#F0E8DF] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5A6E]">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EF709D]">{stats?.completionRate || 0}%</div>
            <p className="text-xs text-[#6B5A6E]">{stats?.completed || 0} completaram</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#F0E8DF] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5A6E]">Taxa de Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#CA3716]">{stats?.checkoutRate || 0}%</div>
            <p className="text-xs text-[#6B5A6E]">{stats?.checkoutClicked || 0} clicaram</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#F0E8DF] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5A6E]">Leads Capturados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#710C60]">{stats?.leads || 0}</div>
            <p className="text-xs text-[#6B5A6E]">com email ou whatsapp</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#2A1F30]">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 120, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" />
                <XAxis type="number" domain={[0, 100]} stroke="#6B5A6E" />
                <YAxis dataKey="step" type="category" stroke="#6B5A6E" width={100} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #F0E8DF", borderRadius: "8px" }}
                  labelStyle={{ color: "#2A1F30" }}
                />
                <Bar dataKey="pct" fill="#EF709D" radius={[0, 4, 4, 0]}>
                  <LabelList content={renderFunnelLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms Distribution Card (Q2) */}
      {symptoms && symptoms.distribution && symptoms.distribution.length > 0 ? (
        <Card className="bg-white border-[#E5E7EB] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#111827]">Distribuição de Sintomas (Q2)</CardTitle>
            <p className="text-xs text-[#6B7280]">% de pessoas que marcaram cada sintoma</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {symptoms.distribution.map((item) => (
                <div key={item.index} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#111827] truncate max-w-[180px]">{item.label}</span>
                      <span className="text-sm font-medium text-[#F59E0B]">{item.percentage}% ({item.count})</span>
                    </div>
                    <div className="w-full bg-[#FEF3C7] rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-4 pt-3 border-t border-[#E5E7EB]">
              Total de sessões que responderam Q2: {symptoms.total}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-[#E5E7EB] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#111827]">Distribuição de Sintomas (Q2)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#6B7280]">Sem dados disponíveis ainda.</p>
          </CardContent>
        </Card>
      )}

      {/* Dropoff Chart */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#2A1F30]">Abandonaram na pergunta</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dropoff} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" />
                <XAxis dataKey="question" stroke="#6B5A6E" />
                <YAxis stroke="#6B5A6E" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #F0E8DF", borderRadius: "8px" }}
                  labelStyle={{ color: "#2A1F30" }}
                />
                <Line type="monotone" dataKey="count" stroke="#CA3716" strokeWidth={2} dot={{ fill: "#CA3716", r: 5 }}>
                  <LabelList dataKey="count" position="top" fill="#2A1F30" fontSize={11} fontWeight={500} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#2A1F30]">Sessões nos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" />
                <XAxis dataKey="date" stroke="#6B5A6E" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B5A6E" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #F0E8DF", borderRadius: "8px" }}
                  labelStyle={{ color: "#2A1F30" }}
                />
                <Legend />
                <Area type="monotone" dataKey="iniciados" stackId="1" stroke="#6B5A6E" fill="#6B5A6E" fillOpacity={0.3}>
                  <LabelList dataKey="iniciados" position="top" fill="#6B5A6E" fontSize={9} />
                </Area>
                <Area type="monotone" dataKey="completados" stackId="2" stroke="#EF709D" fill="#EF709D" fillOpacity={0.5}>
                  <LabelList dataKey="completados" position="top" fill="#EF709D" fontSize={9} />
                </Area>
                <Area type="monotone" dataKey="checkout" stackId="3" stroke="#710C60" fill="#710C60" fillOpacity={0.5}>
                  <LabelList dataKey="checkout" position="top" fill="#710C60" fontSize={9} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
