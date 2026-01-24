import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Package } from "lucide-react"
import { Container } from "@/components/ui/container"
import { ProductCard } from "@/components/cart/product-card"

// Use ISR with 1 hour revalidation to drastically reduce database queries
// This reduces egress usage significantly while still allowing updates
export const revalidate = 3600 // 1 hour cache - reduces database queries by 60x

async function getProducts() {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return []
    }

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      take: 100, // Limit to 100 products for better performance
      select: {
        id: true,
        nameFr: true,
        slug: true,
        price: true,
        imageUrl: true,
        stock: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    return products
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
    
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL
    const isDev = process.env.NODE_ENV === 'development'
    
    // Log errors in development or if not a connection error/build-time error
    if (isDev || (!isConnectionError && !isBuildTime)) {
      console.error("Error fetching products:", error)
    } else if (isConnectionError && isDev) {
      // For connection errors in development, log a brief warning
      console.warn("Database connection error, returning empty products:", error?.message || error)
    }
    
    // Return empty array on error to prevent page crash
    return []
  }
}

export default async function ProductsPage() {
  try {
    let products: Awaited<ReturnType<typeof getProducts>> = []
    
    try {
      products = await getProducts()
      // Ensure products is always an array
      if (!Array.isArray(products)) {
        products = []
      }
    } catch (error: any) {
      // Handle errors gracefully - always return empty array to prevent 404
      console.error("Error fetching products:", error?.message || error)
      products = [] // Ensure it's always an array
    }

    // Always render the page, even with empty products
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Container className="py-10 sm:py-12">
            {/* Page Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-foreground">
                Tous les produits
              </h1>
              <p className="text-sm text-muted-foreground">
                Découvrez notre sélection complète de produits frais
              </p>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  try {
                    return (
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          slug: product.slug,
                          nameFr: product.nameFr,
                          price: Number(product.price),
                          imageUrl: product.imageUrl,
                          stock: product.stock,
                        }}
                      />
                    )
                  } catch (error) {
                    console.error("Error rendering product card:", error)
                    return null
                  }
                })}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Aucun produit disponible</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Les produits seront ajoutés prochainement.
                </p>
                <Link href="/categories">
                  <button className="text-sm text-primary hover:underline font-medium">
                    Parcourir les catégories
                  </button>
                </Link>
              </div>
            )}
          </Container>
        </main>
        <Footer />
      </div>
    )
  } catch (error: any) {
    // Ultimate fallback - if anything fails, render a simple error page
    console.error("Critical error in ProductsPage:", error)
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Container className="py-10 sm:py-12">
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Chargement des produits</h3>
              <p className="text-sm text-muted-foreground">
                Veuillez réessayer dans quelques instants.
              </p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }
}

