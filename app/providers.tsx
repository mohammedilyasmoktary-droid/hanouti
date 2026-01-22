"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/components/cart/cart-context"
import { FloatingCartButton } from "@/components/cart/floating-cart-button"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <FloatingCartButton />
      </CartProvider>
    </SessionProvider>
  )
}

