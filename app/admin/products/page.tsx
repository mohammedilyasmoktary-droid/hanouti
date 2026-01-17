import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Package } from "lucide-react"
import { ProductsList } from "@/components/admin/products-list"

async function getProducts(categoryId?: string) {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return []
    }
    
    // Build where clause
    const where = categoryId ? { categoryId } : {}
    
    // Limit to 100 products per page for performance
    return await prisma.product.findMany({
      where,
      take: 100, // Limit to prevent loading thousands of products
      select: {
        id: true,
        nameFr: true,
        nameAr: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        isActive: true,
        createdAt: true,
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
  } catch (error: any) {
    console.error("Error fetching products:", error)
    // Return empty array to prevent page crash
    return []
  }
}

async function getCategoryName(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { nameFr: true },
    })
    return category?.nameFr || null
  } catch (error) {
    console.error("Error fetching category name:", error)
    return null
  }
}

// Force dynamic rendering for admin pages to always get fresh data
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const categoryId = params?.category
  let products = await getProducts(categoryId)
  const categoryName = categoryId ? await getCategoryName(categoryId) : null

  // Convert Decimal to number for client component
  const productsWithNumbers = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {categoryName ? `Produits - ${categoryName}` : "Produits"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {categoryName 
              ? `${products.length} produit${products.length > 1 ? "s" : ""} dans ${categoryName}`
              : `Gérez vos produits (${products.length} produit${products.length > 1 ? "s" : ""})`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {categoryId && (
            <Link href="/admin/products">
              <Button variant="outline">
                Voir tous les produits
              </Button>
            </Link>
          )}
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </Link>
        </div>
      </div>

      {products.length > 0 ? (
        <ProductsList initialProducts={productsWithNumbers} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun produit</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {categoryName 
                ? `Aucun produit dans la catégorie "${categoryName}".`
                : "Vous n'avez pas encore de produits. Commencez par créer votre premier produit."
              }
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

