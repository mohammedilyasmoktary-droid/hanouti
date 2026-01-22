"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "./cart-context"
import { cn } from "@/lib/utils"

export function FloatingCartButton() {
  const { itemCount, total } = useCart()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [prevItemCount, setPrevItemCount] = useState(0)

  // Hide on cart page and admin pages
  const isCartPage = pathname === "/cart"
  const isAdminPage = pathname?.startsWith("/admin")

  // Show button when cart has items
  useEffect(() => {
    if (itemCount > 0 && !isCartPage && !isAdminPage) {
      setIsVisible(true)
      // Trigger animation when item count increases
      if (itemCount > prevItemCount) {
        setJustAdded(true)
        const timer = setTimeout(() => setJustAdded(false), 600)
        setPrevItemCount(itemCount)
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [itemCount, isCartPage, isAdminPage, prevItemCount])

  // Don't render on cart page or admin pages
  if (isCartPage || isAdminPage) return null

  return (
    <Link
      href="/cart"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-3",
        "bg-primary text-primary-foreground",
        "px-4 py-3 sm:px-5 sm:py-4",
        "rounded-full shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none",
        justAdded && "scale-110"
      )}
      aria-label={`Panier: ${itemCount} article${itemCount > 1 ? "s" : ""}, ${total.toFixed(2)} MAD`}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
        {itemCount > 0 && (
          <span
            className={cn(
              "absolute -top-2 -right-2",
              "text-xs font-bold",
              "rounded-full h-5 w-5 sm:h-6 sm:w-6",
              "flex items-center justify-center",
              "shadow-md",
              "border-2 border-primary",
              "transition-transform duration-300",
              justAdded && "scale-125"
            )}
            style={{ backgroundColor: 'var(--appetite)', color: 'var(--appetite-foreground)' }}
            aria-hidden="true"
          >
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </div>
      <div className="hidden sm:flex flex-col items-start">
        <span className="text-xs font-medium opacity-90">Panier</span>
        <span className="text-sm font-bold">{total.toFixed(2)} MAD</span>
      </div>
    </Link>
  )
}

