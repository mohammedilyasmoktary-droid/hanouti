"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-context"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, itemCount, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8">Panier</h1>
            <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center shadow-sm">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Ajoutez des produits à votre panier pour commencer vos achats.
              </p>
              <Link href="/categories">
                <Button size="lg">Parcourir les catégories</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">Panier</h1>
            <Button variant="outline" size="sm" onClick={clearCart}>
              Vider le panier
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6 flex gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                    {item.imageUrl ? (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted shadow-sm">
                        <img
                          src={item.imageUrl}
                          alt={item.nameFr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted/50 flex items-center justify-center shadow-sm">
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors">
                        {item.nameFr}
                      </h3>
                    </Link>
                    <p className="text-sm sm:text-base font-bold text-primary mb-3 sm:mb-4">
                      {item.price.toFixed(2)} MAD
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center border border-border rounded-lg shadow-xs overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted active:bg-muted/80 transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium min-w-[3rem] text-center bg-background border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted active:bg-muted/80 transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors active:bg-destructive/20"
                        aria-label="Supprimer du panier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg sm:text-xl font-bold">
                      {(item.price * item.quantity).toFixed(2)} MAD
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 sticky top-24 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 sm:mb-6 tracking-tight">Résumé de la commande</h2>
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Articles ({itemCount})</span>
                    <span className="font-medium">{total.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-primary font-medium">Gratuite</span>
                  </div>
                  <div className="border-t border-border pt-3 sm:pt-4">
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-primary">
                      <span>Total</span>
                      <span>{total.toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Passer la commande
                  </Button>
                </Link>
                <Link href="/categories" className="block mt-3">
                  <Button variant="outline" size="lg" className="w-full">
                    Continuer les achats
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
