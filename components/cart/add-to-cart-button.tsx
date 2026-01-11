"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "./cart-context"
import { useState } from "react"

interface AddToCartButtonProps {
  product: {
    id: string
    slug: string
    nameFr: string
    price: number | string
    imageUrl?: string | null
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart({
      id: product.id,
      slug: product.slug,
      nameFr: product.nameFr,
      price: Number(product.price),
      imageUrl: product.imageUrl,
    })
    setTimeout(() => setIsAdding(false), 300)
  }

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAdding}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? "Ajouté !" : "Ajouter au panier"}
    </Button>
  )
}



