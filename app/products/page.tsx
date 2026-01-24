import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Package, ChevronLeft, ChevronRight } from "lucide-react"
import { Container } from "@/components/ui/container"
import { ProductCard } from "@/components/cart/product-card"
import { Button } from "@/components/ui/button"

// Use dynamic rendering for true randomization per request
// Products will be shuffled differently on each page load
export const dynamic = 'force-dynamic'

export const PRODUCTS_PER_PAGE = 24

// Fisher-Yates shuffle algorithm for randomizing array with seed
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  // Simple seeded random number generator
  let random = seed
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280
    return random / 233280
  }
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function getProducts(page: number = 1, seed?: number) {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return { products: [], total: 0 }
    }

    // Fetch all active products (up to 500 for performance)
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      take: 500, // Limit to 500 products for better performance
      select: {
        id: true,
        nameFr: true,
        slug: true,
        price: true,
        imageUrl: true,
        stock: true,
      },
    })

    // Use seed for consistent randomization across pagination
    // If no seed provided, use current timestamp for new randomization
    const shuffleSeed = seed || Math.floor(Date.now() / 1000)
    const shuffledProducts = shuffleArrayWithSeed(allProducts, shuffleSeed)
    
    // Get total count
    const total = shuffledProducts.length
    
    // Paginate the shuffled results
    const validPage = Math.max(1, Math.floor(page))
    const skip = (validPage - 1) * PRODUCTS_PER_PAGE
    const paginatedProducts = shuffledProducts.slice(skip, skip + PRODUCTS_PER_PAGE)
    
    return { products: paginatedProducts, total, seed: shuffleSeed }
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
    return { products: [], total: 0 }
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; seed?: string }>
}) {
  try {
    const params = await searchParams
    const pageParam = params?.page
    const seedParam = params?.seed
    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
    const seed = seedParam ? parseInt(seedParam, 10) : undefined
    
    let result: Awaited<ReturnType<typeof getProducts>> & { seed?: number } = { products: [], total: 0 }
    
    try {
      result = await getProducts(page, seed)
      // Ensure products is always an array
      if (!Array.isArray(result.products)) {
        result.products = []
      }
      if (typeof result.total !== 'number') {
        result.total = result.products.length
      }
    } catch (error: any) {
      // Handle errors gracefully - always return empty array to prevent 404
      console.error("Error fetching products:", error?.message || error)
      result = { products: [], total: 0 }
    }

    const { products, total, seed: resultSeed } = result
    const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE)
    // Use the seed from result (or generate new one) for pagination links
    const paginationSeed = resultSeed || (seed || Math.floor(Date.now() / 1000))

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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {page} sur {totalPages} ({total} produit{total > 1 ? "s" : ""})
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/products?page=${Math.max(1, page - 1)}${paginationSeed ? `&seed=${paginationSeed}` : ''}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={page === 1}
                          className="gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Précédent
                        </Button>
                      </Link>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (page <= 3) {
                            pageNum = i + 1
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = page - 2 + i
                          }
                          return (
                            <Link
                              key={pageNum}
                              href={`/products?page=${pageNum}${paginationSeed ? `&seed=${paginationSeed}` : ''}`}
                            >
                              <Button
                                variant={page === pageNum ? "default" : "outline"}
                                size="sm"
                                className="min-w-[2.5rem]"
                              >
                                {pageNum}
                              </Button>
                            </Link>
                          )
                        })}
                      </div>
                      <Link href={`/products?page=${Math.min(totalPages, page + 1)}${paginationSeed ? `&seed=${paginationSeed}` : ''}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={page === totalPages}
                          className="gap-2"
                        >
                          Suivant
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
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

