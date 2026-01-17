import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Package } from "lucide-react"
import { Container } from "@/components/ui/container"
import { CategoryCard } from "@/components/cards/category-card"

// Use dynamic rendering - page is too large for ISR (Vercel limit ~4.5MB)
// Still optimized with query limits and selective field fetching
export const dynamic = 'force-dynamic'

async function getCategories() {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return []
    }

    // Optimize query - use select instead of include for better performance
    // Limit to 30 categories and count children instead of loading them all
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Top-level categories only
      },
      take: 30, // Reduced to 30 for faster loading
      select: {
        id: true,
        nameFr: true,
        nameAr: true,
        slug: true,
        imageUrl: true,
        sortOrder: true,
        _count: {
          select: {
            children: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    })
    
    return categories
  } catch (error: any) {
    // Handle errors gracefully - log in development/production
    const isDbConnectionError = 
      error?.message?.includes("Can't reach database") ||
      error?.code === 'P1001' ||
      error?.name === 'PrismaClientInitializationError'
    
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL
    
    // Log errors in development or if not a build-time DB error
    if (process.env.NODE_ENV === 'development' || (!isDbConnectionError && !isBuildTime)) {
      console.error("Error fetching categories:", error)
    }
    return []
  }
}

export default async function CategoriesPage() {
  try {
    let categories: Awaited<ReturnType<typeof getCategories>> = []
    
    try {
      categories = await getCategories()
      // Ensure categories is always an array
      if (!Array.isArray(categories)) {
        categories = []
      }
    } catch (error: any) {
      // Handle errors gracefully - always return empty array to prevent 404
      console.error("Error fetching categories:", error?.message || error)
      categories = [] // Ensure it's always an array
    }

    // Always render the page, even with empty categories
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Container className="py-10 sm:py-12">
            {/* Page Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">
                Toutes les catégories
              </h1>
              <p className="text-sm text-zinc-600">
                Parcourez notre sélection complète de produits frais
              </p>
            </div>

            {/* Categories Grid */}
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  try {
                    return (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        showSubcategories={(category._count?.children || 0) > 0}
                        subcategoryCount={category._count?.children || 0}
                      />
                    )
                  } catch (error) {
                    console.error("Error rendering category card:", error)
                    return null
                  }
                })}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center shadow-sm">
                <Package className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">Aucune catégorie disponible</h3>
                <p className="text-sm text-zinc-600">
                  Les catégories seront ajoutées prochainement.
                </p>
              </div>
            )}
          </Container>
        </main>
        <Footer />
      </div>
    )
  } catch (error: any) {
    // Ultimate fallback - if anything fails, render a simple error page
    console.error("Critical error in CategoriesPage:", error)
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Container className="py-10 sm:py-12">
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center shadow-sm">
              <Package className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-zinc-900">Chargement des catégories</h3>
              <p className="text-sm text-zinc-600">
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
