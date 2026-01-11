import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Package } from "lucide-react"
import { ProductsList } from "@/components/admin/products-list"

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: {
        select: {
          id: true,
          nameFr: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  // Convert Decimal to number for client component
  const productsWithNumbers = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos produits ({products.length} produit{products.length > 1 ? "s" : ""})
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {products.length > 0 ? (
        <ProductsList initialProducts={productsWithNumbers} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun produit</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Vous n&apos;avez pas encore de produits. Commencez par créer votre premier produit.
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un produit
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

