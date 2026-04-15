"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Globe, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/utms", label: "UTMs", icon: Globe },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      {/* Header */}
      <header className="bg-white border-b border-[#F0E8DF] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#710C60] font-bold text-lg">Quiz VCNL</span>
          <span className="text-[#6B5A6E] text-sm">· Painel</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[#6B5A6E] hover:text-[#710C60] hover:bg-[#F0E8DF]"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-[#F0E8DF] min-h-[calc(100vh-57px)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-[#EF709D]/10 text-[#710C60] font-medium"
                      : "text-[#6B5A6E] hover:text-[#710C60] hover:bg-[#F0E8DF]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
