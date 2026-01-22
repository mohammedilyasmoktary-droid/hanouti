"use client"

import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "./cart-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    nameFr: string
    price: number | string
    imageUrl?: string | null
    stock?: number
  }
  variant?: "default" | "compact"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
      {/* Product Image - Fixed Square Aspect Ratio */}
      <Link href={`/products/${product.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-2xl" aria-label={`Voir ${product.nameFr}`}>
        <div className="aspect-square bg-muted overflow-hidden relative">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.nameFr}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>
      </Link>

      {/* Product Info - Content pinned to bottom */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
          <h3 className="font-medium text-sm text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
            {product.nameFr}
          </h3>
        </Link>
        
        {/* Price and Button - Always at bottom */}
        <div className="mt-auto space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary">
              {Number(product.price).toFixed(2)} MAD
            </span>
          </div>
          {isOutOfStock ? (
            <Button 
              size="sm" 
              className="w-full h-10 rounded-xl" 
              disabled 
              variant="outline"
            >
              Rupture de stock
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full h-10 rounded-xl"
              onClick={handleAddToCart}
              disabled={isAdding}
              variant="default"
              aria-label={`Ajouter ${product.nameFr} au panier`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
              {isAdding ? "Ajouté !" : "Ajouter"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

