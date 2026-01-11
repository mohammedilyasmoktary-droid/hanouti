"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/components/cart/cart-context"
import { ShoppingCart, CheckCircle2, Download, Package, MapPin, Phone, Receipt, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  })

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
            <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center shadow-sm">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6">
                Ajoutez des produits à votre panier pour continuer.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create order
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: null,
        deliveryMethod: deliveryMethod === "delivery" ? "DELIVERY" : "PICKUP",
        address: deliveryMethod === "delivery" ? formData.address : null,
        city: deliveryMethod === "delivery" ? formData.city : null,
        notes: formData.notes || null,
        items: items.map((item) => ({
          productId: item.id,
          nameFr: item.nameFr,
          price: item.price,
          quantity: item.quantity,
        })),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const order = await res.json()
        setIsSubmitting(false)
        setIsSuccess(true)
        setOrderData(order) // Store full order data for receipt display
        clearCart()
      } else {
        const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        const errorMessage = errorData.error || errorData.message || "Erreur lors de la création de la commande"
        alert(errorMessage)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur réseau est survenue. Veuillez réessayer."
      alert(errorMessage)
      setIsSubmitting(false)
    }
  }

  if (isSuccess && orderData) {
    const statusLabels: Record<string, string> = {
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      READY: "Prête",
      DELIVERING: "En livraison",
      DELIVERED: "Livrée",
      CANCELLED: "Annulée",
    }

    const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      PREPARING: "default",
      READY: "default",
      DELIVERING: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
    }

    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-zinc-900">Commande confirmée !</h1>
              <p className="text-muted-foreground text-base">
                Merci pour votre commande. Nous vous contacterons bientôt pour confirmer{" "}
                {orderData.deliveryMethod === "DELIVERY" ? "la livraison" : "le retrait"}.
              </p>
            </div>

            {/* Order Receipt Card */}
            <Card className="border-zinc-200/60 rounded-2xl shadow-sm mb-6">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">Commande {orderData.orderNumber}</CardTitle>
                    <CardDescription>
                      Passée le {format(new Date(orderData.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusColors[orderData.status] || "default"} className="text-sm">
                      {statusLabels[orderData.status] || orderData.status}
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        window.open(`/api/orders/${orderData.id}/receipt`, "_blank")
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger le reçu
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-3">Informations client</h3>
                    <div className="space-y-2 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        <span>{orderData.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{orderData.customerPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-3">Livraison</h3>
                    <div className="space-y-2 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>
                          {orderData.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
                        </span>
                      </div>
                      {orderData.deliveryMethod === "DELIVERY" && (orderData.address || orderData.city) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {orderData.address}
                            {orderData.city && `, ${orderData.city}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="pt-4 border-t border-zinc-200">
                  <h3 className="font-semibold text-sm text-zinc-900 mb-4">Articles commandés</h3>
                  <div className="space-y-2">
                    {orderData.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm text-zinc-900">{item.nameFr}</div>
                          <div className="text-xs text-zinc-600">
                            {Number(item.price).toFixed(2)} MAD × {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-zinc-900">
                          {(Number(item.price) * item.quantity).toFixed(2)} MAD
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-zinc-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-zinc-900">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {Number(orderData.total).toFixed(2)} MAD
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {orderData.notes && (
                  <div className="pt-4 border-t border-zinc-200">
                    <h3 className="font-semibold text-sm text-zinc-900 mb-2">Notes</h3>
                    <p className="text-sm text-zinc-600">{orderData.notes}</p>
                  </div>
                )}

                {/* Important Info */}
                <div className="pt-4 border-t border-zinc-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Prochaines étapes</p>
                      <p className="text-blue-700">
                        Nous traiterons votre commande dans les plus brefs délais. Vous recevrez un appel de confirmation
                        sous peu. Conservez votre numéro de commande <strong>{orderData.orderNumber}</strong> pour
                        suivre votre commande.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/my-receipt">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Suivre ma commande
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  Retour à l&apos;accueil
                </Button>
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Commande</h1>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 tracking-tight">
                  {deliveryMethod === "delivery" ? "Informations de livraison" : "Informations de retrait"}
                </h2>

                {/* Delivery Method Selection */}
                <div>
                  <Label htmlFor="deliveryMethod">Mode de réception *</Label>
                  <Select value={deliveryMethod} onValueChange={(value: "delivery" | "pickup") => setDeliveryMethod(value)}>
                    <SelectTrigger id="deliveryMethod" className="w-full mt-2">
                      <SelectValue placeholder="Choisir un mode de réception" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Livraison à domicile</SelectItem>
                      <SelectItem value="pickup">Retrait en magasin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ahmed Benali"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                {/* Show address fields only for delivery */}
                {deliveryMethod === "delivery" && (
                  <>
                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        required={deliveryMethod === "delivery"}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Rue Mohammed V"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        required={deliveryMethod === "delivery"}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Casablanca"
                      />
                    </div>
                  </>
                )}

                {/* Notes field - different placeholder based on delivery method */}
                <div>
                  <Label htmlFor="notes">
                    {deliveryMethod === "delivery" ? "Notes de livraison" : "Notes de commande"} (optionnel)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={
                      deliveryMethod === "delivery"
                        ? "Instructions spéciales pour la livraison..."
                        : "Informations supplémentaires pour votre commande..."
                    }
                    rows={4}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Traitement..." : `Confirmer la commande (${total.toFixed(2)} MAD)`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 sticky top-24 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 sm:mb-6 tracking-tight">Résumé</h2>
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Articles ({itemCount})</span>
                    <span className="font-medium">{total.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">
                      {deliveryMethod === "delivery" ? "Livraison" : "Retrait"}
                    </span>
                    <span className="text-primary font-medium">Gratuit</span>
                  </div>
                  <div className="border-t border-border pt-3 sm:pt-4">
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-primary">
                      <span>Total</span>
                      <span>{total.toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
                <Link href="/cart">
                  <Button variant="outline" size="lg" className="w-full">
                    Modifier le panier
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
