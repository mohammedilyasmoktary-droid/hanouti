import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Protect admin routes (except login page and API routes)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !pathname.startsWith("/api/auth")) {
      const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
      
      if (!secret) {
        console.error("[Proxy] NEXTAUTH_SECRET or AUTH_SECRET not set")
        const loginUrl = new URL("/admin/login", request.url)
        return NextResponse.redirect(loginUrl)
      }

      let token
      try {
        // Get all cookies to debug
        const cookieHeader = request.headers.get("cookie") || ""
        const allCookies = cookieHeader.split(";").map(c => c.trim())
        
        // Try multiple cookie names (NextAuth v5 uses different names)
        const cookieNames = [
          "__Secure-authjs.session-token",
          "authjs.session-token",
          "__Secure-next-auth.session-token",
          "next-auth.session-token",
        ]
        
        let token = null
        for (const cookieName of cookieNames) {
          try {
            token = await getToken({
              req: request,
              secret,
              cookieName,
            })
            if (token) {
              console.log("[Proxy] Found token with cookie name:", cookieName)
              break
            }
          } catch (e) {
            // Try next cookie name
            continue
          }
        }
        
        // Debug logging
        console.log("[Proxy] Token check:", {
          hasToken: !!token,
          tokenRole: token?.role,
          tokenEmail: token?.email,
          cookieCount: allCookies.length,
          hasAuthCookie: allCookies.some(c => c.includes("authjs") || c.includes("session")),
          cookieNames: allCookies.map(c => c.split("=")[0]).join(", "),
        })
      } catch (e) {
        console.error("[Proxy] Error getting token:", e)
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (!token || (token as any).role !== "ADMIN") {
        console.log("[Proxy] No token or not ADMIN, redirecting to login", {
          hasToken: !!token,
          role: (token as any)?.role,
        })
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return response
  } catch (error) {
    console.error("[Proxy] Unexpected error:", error)
    // On error, allow the request to continue (let the layout handle it)
    const response = NextResponse.next()
    response.headers.set("x-pathname", request.nextUrl.pathname)
    return response
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}

