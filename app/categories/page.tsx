import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Package } from "lucide-react"
import { Container } from "@/components/ui/container"
import { CategoryCard } from "@/components/cards/category-card"

// Use ISR - revalidate every 60 seconds for faster page loads
export const revalidate = 60

async function getCategories() {
  return await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null, // Top-level categories only
    },
    include: {
      children: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          nameFr: true,
          nameAr: true,
          slug: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

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
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  showSubcategories={category.children.length > 0}
                  subcategoryCount={category.children.length}
                />
              ))}
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
}
