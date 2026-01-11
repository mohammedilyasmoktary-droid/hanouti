import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Protect admin routes (except login page and API routes)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !pathname.startsWith("/api/auth")) {
      const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
      
      if (!secret) {
        console.error("[Middleware] NEXTAUTH_SECRET or AUTH_SECRET not set")
        const loginUrl = new URL("/admin/login", request.url)
        return NextResponse.redirect(loginUrl)
      }

      let token
      try {
        token = await getToken({
          req: request,
          secret,
        })
      } catch (e) {
        console.error("[Middleware] Error getting token:", e)
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (!token || token.role !== "ADMIN") {
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return response
  } catch (error) {
    console.error("[Middleware] Unexpected error:", error)
    // On error, allow the request to continue (let the layout handle it)
    const response = NextResponse.next()
    response.headers.set("x-pathname", request.nextUrl.pathname)
    return response
  }
}

export { middleware }

export const config = {
  matcher: ["/admin/:path*"],
}
