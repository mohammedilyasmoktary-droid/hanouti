import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Package } from "lucide-react"
import { ProductsList } from "@/components/admin/products-list"

export const PRODUCTS_PER_PAGE = 25

async function getProducts(categoryId?: string, page: number = 1) {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return { products: [], total: 0 }
    }
    
    // Ensure page is valid
    const validPage = Math.max(1, Math.floor(page))
    const skip = (validPage - 1) * PRODUCTS_PER_PAGE
    
    // Build where clause - only include if categoryId is provided
    const whereClause = categoryId && categoryId.trim() 
      ? { categoryId: categoryId.trim() } 
      : undefined
    
    // Build query options for findMany
    const findManyOptions = {
      ...(whereClause && { where: whereClause }),
      skip,
      take: PRODUCTS_PER_PAGE,
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
        createdAt: "desc" as const,
      },
    }
    
    // Get total count and products in parallel
    const [total, products] = await Promise.all([
      prisma.product.count(whereClause ? { where: whereClause } : undefined),
      prisma.product.findMany(findManyOptions),
    ])
    
    return { products, total }
  } catch (error: any) {
    // Handle all database connection errors gracefully
    const isConnectionError = 
      error?.message?.includes('MaxClientsInSessionMode') ||
      error?.message?.includes('max clients reached') ||
      error?.message?.includes('pool_size') ||
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes('database server') ||
      error?.message?.includes('connection') ||
      error?.code === 'P1001' ||
      error?.code === 'P1000' ||
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientConnectionError'
    
    // Only log detailed errors in development or for non-connection errors
    if (process.env.NODE_ENV === 'development' || !isConnectionError) {
      console.error("Error fetching products:", error)
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
      })
    } else {
      // For connection errors, just log a brief warning
      console.warn("Database connection error, returning empty results")
    }
    
    // Return empty array to prevent page crash
    return { products: [], total: 0 }
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
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const params = await searchParams
  const categoryId = params?.category?.trim() || undefined
  const pageParam = params?.page
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
  
  // Optimized: Run queries in parallel when categoryId is provided
  const [{ products, total }, categoryName] = await Promise.all([
    getProducts(categoryId, page),
    categoryId ? getCategoryName(categoryId) : Promise.resolve(null),
  ])

  // Convert Decimal to number for client component
  const productsWithNumbers = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }))
  
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {categoryName ? `Produits - ${categoryName}` : "Produits"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {categoryName 
              ? `${total} produit${total > 1 ? "s" : ""} dans ${categoryName} (page ${page}/${totalPages})`
              : `Gérez vos produits (${total} produit${total > 1 ? "s" : ""}, page ${page}/${totalPages})`
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
        <ProductsList 
          initialProducts={productsWithNumbers} 
          currentPage={page}
          totalPages={totalPages}
          totalProducts={total}
          categoryId={categoryId}
        />
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

