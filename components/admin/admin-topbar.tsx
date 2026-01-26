"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut, ExternalLink, Menu } from "lucide-react"

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6 shadow-sm">
      <div className="flex items-center space-x-3 lg:space-x-4">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-zinc-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-zinc-700" />
          </button>
        )}
        <h1 className="text-base lg:text-lg font-semibold tracking-tight">Administration</h1>
      </div>
      <div className="flex items-center space-x-2 lg:space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open("/", "_blank")}
          className="gap-2 text-xs lg:text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Voir le site</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-xs lg:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

