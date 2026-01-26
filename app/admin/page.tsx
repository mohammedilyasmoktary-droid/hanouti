import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, TrendingUp, ShoppingCart, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

export const dynamic = "force-dynamic"

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

async function getStats() {
  try {
    const [categoryCount, productCount, pendingOrdersCount] = await Promise.all([
      prisma.category.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ])

    return { categoryCount, productCount, pendingOrdersCount }
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Return default values on error
    return { categoryCount: 0, productCount: 0, pendingOrdersCount: 0 }
  }
}

async function getRecentOrders() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return orders.map((order) => ({
      ...order,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return []
  }
}

export default async function AdminDashboard() {
  let stats = { categoryCount: 0, productCount: 0, pendingOrdersCount: 0 }
  let recentOrders: Awaited<ReturnType<typeof getRecentOrders>> = []
  
  try {
    [stats, recentOrders] = await Promise.all([
      getStats(),
      getRecentOrders(),
    ])
  } catch (error) {
    console.error("Error in AdminDashboard:", error)
    // Continue with default stats
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Vue d&apos;ensemble de votre boutique
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoryCount}</div>
            <p className="text-xs text-muted-foreground">Catégories actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground">Produits actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Nouvelle commande{stats.pendingOrdersCount > 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Actif</div>
            <p className="text-xs text-muted-foreground">Boutique opérationnelle</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Commandes récentes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Les 5 dernières commandes
            </p>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              Voir toutes les commandes
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders`}
                  className="block p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-sm">
                          {order.orderNumber}
                        </span>
                        <Badge variant={statusColors[order.status] || "default"}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{order.customerName}</span>
                        {" • "}
                        <span>{order.customerPhone}</span>
                        {" • "}
                        <span>{order.itemCount} article{order.itemCount > 1 ? "s" : ""}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-primary">
                        {order.total.toFixed(2)} MAD
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune commande récente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

