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
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Overview</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Sessões Iniciadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-neutral-500">
              Hoje: {stats?.sessionsToday || 0} | 7 dias: {stats?.sessions7d || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EF709D]">{stats?.completionRate || 0}%</div>
            <p className="text-xs text-neutral-500">{stats?.completed || 0} completaram</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Taxa de Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#710C60]">{stats?.checkoutRate || 0}%</div>
            <p className="text-xs text-neutral-500">{stats?.checkoutClicked || 0} clicaram</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Leads Capturados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.leads || 0}</div>
            <p className="text-xs text-neutral-500">com email ou whatsapp</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" domain={[0, 100]} stroke="#666" />
              <YAxis dataKey="step" type="category" stroke="#666" width={100} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="pct" fill="#EF709D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dropoff Chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Dropoff por Pergunta</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dropoff} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="question" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="pct" stroke="#EF709D" strokeWidth={2} dot={{ fill: "#EF709D" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Sessões nos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Area type="monotone" dataKey="iniciados" stackId="1" stroke="#666" fill="#666" fillOpacity={0.6} />
              <Area type="monotone" dataKey="completados" stackId="2" stroke="#EF709D" fill="#EF709D" fillOpacity={0.6} />
              <Area type="monotone" dataKey="checkout" stackId="3" stroke="#710C60" fill="#710C60" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
