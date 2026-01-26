"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, Package, ShoppingBag, Settings, ShoppingCart, MessageSquare, Home, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/homepage", label: "Page d'accueil", icon: Home },
  { href: "/admin/categories", label: "Catégories", icon: Package },
  { href: "/admin/products", label: "Produits", icon: ShoppingBag },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
]

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen?: boolean; setIsOpen?: (open: boolean) => void }) {
  const pathname = usePathname()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Use external state if provided, otherwise use internal state
  const sidebarOpen = isOpen !== undefined ? isOpen : internalOpen
  const setSidebarOpen = setIsOpen || setInternalOpen

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true) // Always open on desktop
      } else if (isOpen === undefined) {
        // Only set internal state if not controlled externally
        setSidebarOpen(false) // Closed by default on mobile
      }
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [isOpen, setSidebarOpen])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "flex w-64 flex-shrink-0 flex-col border-r border-zinc-200 bg-white shadow-sm transition-transform duration-300 ease-in-out",
          "fixed left-0 top-0 z-50 h-full overflow-y-auto",
          isMobile && !sidebarOpen && "-translate-x-full",
          "lg:translate-x-0 lg:static"
        )}
        style={{
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e4e4e7",
        }}
      >
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-6">
        <Link href="/admin" className="flex items-center space-x-2 group" onClick={() => isMobile && setIsOpen(false)}>
          <span className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors">Hanouti</span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium hidden sm:inline">Admin</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-zinc-100 transition-colors"
          aria-label="Toggle menu"
        >
          <X className="h-5 w-5 text-zinc-700" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all shadow-xs cursor-pointer relative z-10",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:shadow-xs active:bg-zinc-200 dark:active:bg-zinc-700"
              )}
              style={
                isActive
                  ? {}
                  : {
                      color: "#18181b",
                      backgroundColor: "transparent",
                    }
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" style={{ color: isActive ? "#ffffff" : "#18181b" }} />
              <span className="whitespace-nowrap" style={{ color: isActive ? "#ffffff" : "#18181b" }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

