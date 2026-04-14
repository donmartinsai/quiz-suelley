import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin/* and /api/admin/* routes (except login)
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/api/admin/login")
  ) {
    const adminAuth = request.cookies.get("admin_auth")?.value
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminAuth || adminAuth !== adminPassword) {
      // For API routes, return 401
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      // For pages, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
