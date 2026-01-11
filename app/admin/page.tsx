import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

async function getStats() {
  try {
    const [categoryCount, productCount] = await Promise.all([
      prisma.category.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
    ])

    return { categoryCount, productCount }
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Return default values on error
    return { categoryCount: 0, productCount: 0 }
  }
}

export default async function AdminDashboard() {
  let stats = { categoryCount: 0, productCount: 0 }
  
  try {
    stats = await getStats()
  } catch (error) {
    console.error("Error in AdminDashboard:", error)
    // Continue with default stats
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble de votre boutique
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Actif</div>
            <p className="text-xs text-muted-foreground">Boutique opérationnelle</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

