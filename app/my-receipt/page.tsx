"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Receipt, Search, Package, MapPin, Calendar, Phone, CheckCircle2, Clock, Truck, XCircle, Download, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

interface OrderItem {
  id: string
  nameFr: string
  price: number
  quantity: number
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

const statusIcons: Record<Order["status"], typeof CheckCircle2> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PREPARING: Clock,
  READY: CheckCircle2,
  DELIVERING: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
}

function normalizePhone(phone: string): string {
  // Remove all spaces, dashes, and parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, "")
  
  // Handle +212 prefix
  if (normalized.startsWith("+212")) {
    normalized = normalized.substring(4)
  }
  
  // Handle 00212 prefix
  if (normalized.startsWith("00212")) {
    normalized = normalized.substring(5)
  }
  
  // Remove leading 0 and add +212
  if (normalized.startsWith("0")) {
    normalized = normalized.substring(1)
  }
  
  // Ensure we have digits only
  normalized = normalized.replace(/\D/g, "")
  
  return normalized
}

function getStatusSteps(currentStatus: Order["status"]) {
  const allSteps = [
    { key: "PENDING" as const, label: "Commande passée", icon: Clock },
    { key: "CONFIRMED" as const, label: "Confirmée", icon: CheckCircle2 },
    { key: "PREPARING" as const, label: "En préparation", icon: Clock },
    { key: "READY" as const, label: "Prête", icon: CheckCircle2 },
    { key: "DELIVERING" as const, label: "En livraison", icon: Truck },
    { key: "DELIVERED" as const, label: "Livrée", icon: CheckCircle2 },
  ]
  
  const cancelledSteps = [
    { key: "PENDING" as const, label: "Commande passée", icon: Clock },
    { key: "CANCELLED" as const, label: "Annulée", icon: XCircle },
  ]
  
  if (currentStatus === "CANCELLED") {
    return cancelledSteps.map(step => ({
      ...step,
      completed: step.key === "PENDING" || step.key === "CANCELLED",
      current: step.key === "CANCELLED",
    }))
  }
  
  const statusOrder = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERING", "DELIVERED"]
  const currentIndex = statusOrder.indexOf(currentStatus)
  
  return allSteps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    current: index === currentIndex,
  }))
}

export default function MyReceiptPage() {
  const [phone, setPhone] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const fetchOrder = useCallback(async (isRefresh = false) => {
    const phoneTrimmed = phone.trim()
    const orderNumberTrimmed = orderNumber.trim()

    if (!phoneTrimmed || !orderNumberTrimmed) {
      return // Can't fetch without required data
    }

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneTrimmed,
          orderNumber: orderNumberTrimmed.toUpperCase(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setOrder(data)
        setError(null)
      } else {
        // Only set error if it's not a refresh (to avoid clearing the displayed order)
        if (!isRefresh) {
          setError(data.error || "Commande introuvable. Vérifiez votre numéro de téléphone et le numéro de commande.")
        }
      }
    } catch (err) {
      console.error("Error looking up order:", err)
      if (!isRefresh) {
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
    }
  }, [phone, orderNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrder(null)
    setSearched(false)

    try {
      // Basic validation
      const phoneTrimmed = phone.trim()
      const orderNumberTrimmed = orderNumber.trim()

      if (!phoneTrimmed) {
        setError("Veuillez entrer votre numéro de téléphone")
        setLoading(false)
        return
      }

      if (!orderNumberTrimmed) {
        setError("Veuillez entrer le numéro de commande")
        setLoading(false)
        return
      }

      // Validate phone has some digits (at least 8 digits after removing non-digits)
      const phoneDigitsOnly = phoneTrimmed.replace(/\D/g, "")
      if (phoneDigitsOnly.length < 8) {
        setError("Numéro de téléphone invalide. Veuillez vérifier le format (ex: +212 6XX XXX XXX ou 06XX XXX XXX)")
        setLoading(false)
        return
      }

      await fetchOrder(false)
      setSearched(true)
    } catch (err) {
      console.error("Error looking up order:", err)
      setError("Une erreur est survenue. Veuillez réessayer.")
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!order) return
    setRefreshing(true)
    await fetchOrder(true)
    setRefreshing(false)
  }

  // Auto-refresh every 30 seconds if order is displayed and auto-refresh is enabled
  useEffect(() => {
    if (!order || !autoRefreshEnabled || !searched || !phone.trim() || !orderNumber.trim()) return

    const interval = setInterval(() => {
      fetchOrder(true)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [order, autoRefreshEnabled, searched, phone, orderNumber, fetchOrder])

  const statusSteps = order ? getStatusSteps(order.status) : []

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Container className="py-10 sm:py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">
              Retrouver ma commande
            </h1>
            <p className="text-sm text-zinc-600">
              Entrez votre numéro de téléphone et votre numéro de commande
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 border-zinc-200/60 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Rechercher une commande</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+212 6XX XXX XXX ou 06XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Format accepté: +212, 00212, 0XX, ou 6XX
                  </p>
                </div>

                <div>
                  <Label htmlFor="orderNumber">Numéro de commande *</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="ORD-XXXXX-XXX"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    className="mt-2 font-mono"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Results */}
          {searched && order && (
            <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">Commande {order.orderNumber}</CardTitle>
                    <CardDescription>
                      Passée le {format(new Date(order.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={statusColors[order.status]} className="text-sm">
                      {statusLabels[order.status]}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="flex items-center gap-2"
                      title="Actualiser le statut"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                      {refreshing ? "Actualisation..." : "Actualiser"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(`/api/orders/${order.id}/receipt`, "_blank")
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger le reçu
                    </Button>
                  </div>
                </div>
                {/* Auto-refresh toggle */}
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefreshEnabled}
                      onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                      className="rounded border-zinc-300 text-primary focus:ring-primary"
                    />
                    <span>Actualisation automatique du statut (toutes les 30 secondes)</span>
                  </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Timeline */}
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 mb-4">Statut de la commande</h3>
                  <div className="space-y-3">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex items-center gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              step.completed
                                ? step.current
                                  ? "bg-primary text-white"
                                  : "bg-green-500 text-white"
                                : "bg-zinc-200 text-zinc-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                step.current
                                  ? "text-primary"
                                  : step.completed
                                  ? "text-zinc-900"
                                  : "text-zinc-500"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-2">Informations client</h3>
                    <div className="space-y-1 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-2">Livraison</h3>
                    <div className="space-y-1 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>
                          {order.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
                        </span>
                      </div>
                      {order.deliveryMethod === "DELIVERY" && (order.address || order.city) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {order.address}
                            {order.city && `, ${order.city}`}
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
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm text-zinc-900">{item.nameFr}</div>
                          <div className="text-xs text-zinc-600">
                            {item.price.toFixed(2)} MAD × {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-zinc-900">
                          {(item.price * item.quantity).toFixed(2)} MAD
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
                      {order.total.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Found State */}
          {searched && !order && !loading && (
            <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
              <CardContent className="py-12 text-center">
                <Receipt className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">Aucune commande trouvée</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  Aucune commande ne correspond aux informations fournies.
                </p>
                <p className="text-xs text-zinc-500">
                  Vérifiez que le numéro de téléphone et le numéro de commande sont corrects.
                </p>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  )
}

