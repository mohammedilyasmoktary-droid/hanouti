"use client"

import { AdminSidebar } from "./admin-sidebar"
import { AdminTopbar } from "./admin-topbar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [pathname])

  useEffect(() => {
    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        const target = e.target as HTMLElement
        if (!target.closest("aside") && !target.closest("button[aria-label='Toggle menu']")) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("click", handleClickOutside)
    
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <AdminTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

