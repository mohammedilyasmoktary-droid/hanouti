"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingBag, Settings, ShoppingCart, MessageSquare, Home } from "lucide-react"
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

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-zinc-200 bg-white dark:bg-zinc-900 shadow-sm relative z-10">
      <div className="flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 px-6">
        <Link href="/admin" className="flex items-center space-x-2 group">
          <span className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors">Hanouti</span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all shadow-xs cursor-pointer relative z-10",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:shadow-xs active:bg-zinc-200 dark:active:bg-zinc-700"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

