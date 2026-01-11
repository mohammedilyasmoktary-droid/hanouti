"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Search, Calendar, Phone, MapPin, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

interface OrderItem {
  id: string
  nameFr: string
  price: number
  quantity: number
  product: {
    id: string
    nameFr: string
    slug: string
    imageUrl: string | null
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryMethod: "DELIVERY" | "PICKUP"
  address: string | null
  city: string | null
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED" | "CANCELLED"
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<Order["status"], string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERING: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
}

const statusColors: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PREPARING: "default",
  READY: "default",
  DELIVERING: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
}

export default function OrdersPage() {
  const [phone, setPhone] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchOrders = async () => {
    if (!phone.trim()) {
      alert("Veuillez entrer votre numéro de téléphone")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/orders/by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        setSearched(true)
      } else {
        const error = await res.json()
        alert(error.error || "Erreur lors de la recherche")
      }
    } catch (error) {
      console.error("Error searching orders:", error)
      alert("Erreur lors de la recherche des commandes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Mes commandes</h1>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rechercher mes commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+212 6XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchOrders()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={searchOrders} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Rechercher
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {searched && (
            <>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Commande {order.orderNumber}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {mounted
                                  ? format(new Date(order.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })
                                  : new Date(order.createdAt).toLocaleString("fr-FR", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {order.customerPhone}
                              </span>
                            </div>
                          </div>
                          <Badge variant={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Items */}
                          <div>
                            <h3 className="font-semibold mb-2">Articles</h3>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-2 border border-border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    {item.product.imageUrl && (
                                      <img
                                        src={item.product.imageUrl}
                                        alt={item.nameFr}
                                        className="h-10 w-10 rounded object-cover"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium">{item.nameFr}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {item.price.toFixed(2)} MAD × {item.quantity}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="font-semibold">
                                    {(item.price * item.quantity).toFixed(2)} MAD
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div className="border-t border-border pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {order.deliveryMethod === "DELIVERY"
                                  ? order.address
                                    ? `Livraison: ${order.address}${order.city ? `, ${order.city}` : ""}`
                                    : "Livraison à domicile"
                                  : "Retrait en magasin"}
                              </span>
                            </div>
                          </div>

                          {/* Total */}
                          <div className="border-t border-border pt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">Total</span>
                              <span className="text-2xl font-bold text-primary">
                                {order.total.toFixed(2)} MAD
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Aucune commande trouvée</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      Aucune commande n&apos;a été trouvée pour ce numéro de téléphone.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

