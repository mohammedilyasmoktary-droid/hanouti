import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import { OrdersList } from "@/components/admin/orders-list"

// Force dynamic rendering for admin pages to always get fresh data
export const dynamic = 'force-dynamic'

async function getOrders() {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return []
    }
    
    // Optimized: Limit to 50 orders and use select instead of include
    return await prisma.order.findMany({
      take: 50, // Reduced from 100 for better performance
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        deliveryMethod: true,
        address: true,
        city: true,
        notes: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            nameFr: true,
            price: true,
            quantity: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                nameFr: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    // Return empty array to prevent page crash
    return []
  }
}

export default async function AdminOrdersPage() {
  let orders = await getOrders()

  // Convert Decimal to number and Date to string for client component
  const ordersWithNumbers = orders.map((order) => ({
    ...order,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      createdAt: item.createdAt.toISOString(),
    })),
  }))

  // Calculate today's count before converting dates to strings
  const todayCount = orders.filter((o) => {
    const today = new Date()
    const orderDate = new Date(o.createdAt)
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    )
  }).length
  
  const pendingCount = orders.filter((o) => o.status === "PENDING").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commandes</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les commandes ({orders.length} commande{orders.length > 1 ? "s" : ""})
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-primary">{todayCount}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {orders.length > 0 ? (
        <OrdersList initialOrders={ordersWithNumbers} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Les commandes des clients apparaîtront ici.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

