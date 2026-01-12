import { headers } from "next/headers"
import { getServerSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Get pathname to check if this is the login page
    let pathname = ""
    try {
      const headersList = await headers()
      pathname = headersList.get("x-pathname") || ""
    } catch (e) {
      // If headers() fails, continue - middleware will handle routing
    }

    // Don't show sidebar/topbar on login page
    if (pathname === "/admin/login") {
      return <>{children}</>
    }

    // Try to get session (middleware already checked auth, so this should work)
    let session
    try {
      session = await getServerSession()
    } catch (e) {
      // Session check failed - log but still show layout
      // Middleware should have redirected if not authenticated
      console.error("[AdminLayout] Session check failed:", e)
    }

    // If no session or not admin, middleware should have redirected
    // But if we get here, show layout anyway (middleware handles auth)
    // Always show the layout with sidebar - middleware protects the routes
    return (
      <div 
        className="flex min-h-screen bg-muted/50 overflow-x-hidden" 
        style={{ 
          display: "flex !important",
          flexDirection: "row !important",
          width: "100%",
        }}
      >
        <AdminSidebar />
        <div 
          className="flex-1 flex flex-col min-w-0" 
          style={{ 
            flex: "1 1 0% !important", 
            minWidth: 0,
            marginLeft: 0,
          }}
        >
          <AdminTopbar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    )
  } catch (error: any) {
    // Catch any unexpected errors and log them
    console.error("[AdminLayout] Unexpected error:", error?.message || error)
    // Still show layout even on error - better UX than blank page
    return (
      <div className="flex min-h-screen bg-muted/50 overflow-x-hidden" style={{ display: "flex !important" }}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0" style={{ flex: "1 1 0%", minWidth: 0 }}>
          <AdminTopbar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    )
  }
}

