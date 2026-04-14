"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Globe, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/respostas", label: "Respostas", icon: FileText },
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
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="bg-black border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#EF709D] font-bold text-lg">Quiz Suelley</span>
          <span className="text-neutral-500 text-sm">— Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 border-r border-neutral-800 min-h-[calc(100vh-57px)] p-4">
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
                      ? "bg-[#EF709D]/10 text-[#EF709D]"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
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
