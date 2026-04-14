"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

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

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [dropoff, setDropoff] = useState<DropoffItem[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, funnelRes, dropoffRes, timelineRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/funnel"),
          fetch("/api/admin/dropoff"),
          fetch("/api/admin/timeline?days=30"),
        ])

        const statsData = await statsRes.json()
        const funnelData = await funnelRes.json()
        const dropoffData = await dropoffRes.json()
        const timelineData = await timelineRes.json()

        setStats(statsData)
        setFunnel(funnelData.funnel || [])
        setDropoff(dropoffData.dropoff || [])
        setTimeline(timelineData.timeline || [])
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
        <CardHeader>
          <CardTitle className="text-[#2A1F30]">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" />
              <XAxis type="number" domain={[0, 100]} stroke="#6B5A6E" />
              <YAxis dataKey="step" type="category" stroke="#6B5A6E" width={100} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #F0E8DF", borderRadius: "8px" }}
                labelStyle={{ color: "#2A1F30" }}
              />
              <Bar dataKey="pct" fill="#EF709D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dropoff Chart */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2A1F30]">Dropoff por Pergunta</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dropoff} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" />
              <XAxis dataKey="question" stroke="#6B5A6E" />
              <YAxis stroke="#6B5A6E" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #F0E8DF", borderRadius: "8px" }}
                labelStyle={{ color: "#2A1F30" }}
              />
              <Line type="monotone" dataKey="pct" stroke="#CA3716" strokeWidth={2} dot={{ fill: "#CA3716" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card className="bg-white border-[#F0E8DF] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2A1F30]">Sessões nos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" />
              <XAxis dataKey="date" stroke="#6B5A6E" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6B5A6E" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #F0E8DF", borderRadius: "8px" }}
                labelStyle={{ color: "#2A1F30" }}
              />
              <Legend />
              <Area type="monotone" dataKey="iniciados" stackId="1" stroke="#6B5A6E" fill="#6B5A6E" fillOpacity={0.3} />
              <Area type="monotone" dataKey="completados" stackId="2" stroke="#EF709D" fill="#EF709D" fillOpacity={0.5} />
              <Area type="monotone" dataKey="checkout" stackId="3" stroke="#710C60" fill="#710C60" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
