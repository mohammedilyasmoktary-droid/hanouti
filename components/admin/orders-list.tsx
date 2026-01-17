"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Package, Phone, MapPin, Calendar, Download } from "lucide-react"
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
  customerEmail: string | null
  deliveryMethod: "DELIVERY" | "PICKUP"
  address: string | null
  city: string | null
  notes: string | null
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

export function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const updatedOrder = await res.json()
        setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)))
        router.refresh()
      } else {
        const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        console.error("Error updating order status:", res.status, error)
        alert(error.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Erreur lors de la mise à jour du statut")
    } finally {
      setUpdating(null)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30">
              <TableHead className="font-semibold">N° Commande</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Articles</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </div>
                    {order.deliveryMethod === "DELIVERY" && order.address && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {order.address}, {order.city}
                      </div>
                    )}
                    {order.deliveryMethod === "PICKUP" && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Retrait en magasin
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.items.length} article{order.items.length > 1 ? "s" : ""}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{Number(order.total).toFixed(2)} MAD</span>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value: Order["status"]) => updateOrderStatus(order.id, value)}
                    disabled={updating === order.id}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {mounted
                      ? format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: fr })
                      : new Date(order.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Voir les détails</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Commande {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  Détails de la commande
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Informations client</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Nom:</strong> {selectedOrder.customerName}</div>
                      <div><strong>Téléphone:</strong> {selectedOrder.customerPhone}</div>
                      {selectedOrder.customerEmail && (
                        <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Livraison</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Mode:</strong> {selectedOrder.deliveryMethod === "DELIVERY" ? "Livraison" : "Retrait"}
                      </div>
                      {selectedOrder.deliveryMethod === "DELIVERY" && (
                        <>
                          {selectedOrder.address && (
                            <div><strong>Adresse:</strong> {selectedOrder.address}</div>
                          )}
                          {selectedOrder.city && (
                            <div><strong>Ville:</strong> {selectedOrder.city}</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Articles</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.product.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.nameFr}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.nameFr}</div>
                            <div className="text-sm text-muted-foreground">
                              {Number(item.price).toFixed(2)} MAD × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          {(Number(item.price) * item.quantity).toFixed(2)} MAD
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {Number(selectedOrder.total).toFixed(2)} MAD
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Créée le:{" "}
                    {mounted
                      ? format(new Date(selectedOrder.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })
                      : new Date(selectedOrder.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </div>
                  {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                    <div>
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Modifiée le:{" "}
                      {mounted
                        ? format(new Date(selectedOrder.updatedAt), "dd MMMM yyyy à HH:mm", { locale: fr })
                        : new Date(selectedOrder.updatedAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => {
                    if (selectedOrder) {
                      window.open(`/api/orders/${selectedOrder.id}/receipt`, "_blank")
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le reçu
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

