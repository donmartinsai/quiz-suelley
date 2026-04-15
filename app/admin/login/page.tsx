"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push("/admin")
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao fazer login")
      }
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white border-[#F0E8DF] shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-[#710C60] text-xl">Quiz VCNL · Painel</CardTitle>
          <CardDescription className="text-[#6B5A6E]">Acesso Administrativo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-[#F0E8DF] text-[#2A1F30] placeholder:text-[#6B5A6E] focus:border-[#EF709D] focus:ring-[#EF709D]/20"
              autoFocus
            />
            {error && <p className="text-[#CA3716] text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#EF709D] hover:bg-[#d85f8a] text-white"
              disabled={loading || !password}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
