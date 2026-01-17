import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Search as SearchIcon } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "@/components/cart/product-card"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"

// Must use force-dynamic because searchParams is dynamic
// Search results are user-specific and can't be statically generated
export const dynamic = 'force-dynamic'

async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  return await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { nameFr: { contains: query, mode: "insensitive" } },
        { nameAr: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 20,
    select: {
      id: true,
      nameFr: true,
      slug: true,
      price: true,
      imageUrl: true,
    },
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  try {
    const params = await searchParams
    const query = params.q || ""
    const products = query ? await searchProducts(query) : []

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Container className="py-10 sm:py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">Recherche</h1>
            {query && (
              <p className="text-sm text-zinc-600">
                {products.length} résultat{products.length !== 1 ? "s" : ""} pour &quot;{query}&quot;
              </p>
            )}
            {!query && (
              <p className="text-sm text-zinc-600">
                Recherchez des produits par nom, description ou catégorie
              </p>
            )}
          </div>

          {/* Empty State - No Query */}
          {!query ? (
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center shadow-sm">
              <SearchIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-zinc-900">Rechercher des produits</h2>
              <p className="text-sm text-zinc-600">
                Utilisez la barre de recherche en haut pour trouver des produits.
              </p>
            </div>
          ) : products.length > 0 ? (
            /* Search Results */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    nameFr: product.nameFr,
                    price: Number(product.price),
                    imageUrl: product.imageUrl,
                  }}
                />
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center shadow-sm">
              <SearchIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-zinc-900">Aucun résultat</h2>
              <p className="text-sm text-zinc-600 mb-4">
                Aucun produit ne correspond à votre recherche &quot;{query}&quot;.
              </p>
              <p className="text-sm text-zinc-600">
                Essayez avec d&apos;autres mots-clés ou parcourez nos{" "}
                <Link href="/categories" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  catégories
                </Link>
                .
              </p>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  )
  } catch (error) {
    console.error("Error in search page:", error)
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Container className="py-10 sm:py-12">
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center shadow-sm">
              <SearchIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-zinc-900">Erreur de recherche</h2>
              <p className="text-sm text-zinc-600 mb-6">
                Une erreur est survenue lors de la recherche. Veuillez réessayer.
              </p>
              <Link href="/search">
                <Button className="rounded-xl">Nouvelle recherche</Button>
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }
}
