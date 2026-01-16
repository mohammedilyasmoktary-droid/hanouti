import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/cart/product-card"
import { Container } from "@/components/ui/container"

// Use ISR - revalidate every 60 seconds for faster page loads
export const revalidate = 60

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          nameFr: true,
          slug: true,
        },
      },
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
      products: {
        where: {
          isActive: true,
        },
        take: 20,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          nameFr: true,
          slug: true,
          price: true,
          imageUrl: true,
        },
      },
    },
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Container className="py-10 sm:py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Accueil</Link>
            {category.parent && (
              <>
                <ChevronRight className="inline h-3 w-3 mx-1" />
                <Link href={`/categories/${category.parent.slug}`} className="hover:text-zinc-900 transition-colors">
                  {category.parent.nameFr}
                </Link>
              </>
            )}
            <ChevronRight className="inline h-3 w-3 mx-1" />
            <span className="text-zinc-900 font-medium">{category.nameFr}</span>
          </nav>

          {/* Hero Row - Clean Layout */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Left: Title + Subtitle */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">
                {category.nameFr}
              </h1>
              {category.nameAr && (
                <p className="text-base text-zinc-600">{category.nameAr}</p>
              )}
            </div>
            
            {/* Right: Small Category Image Thumbnail */}
            {category.imageUrl && (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200/60 shadow-sm relative">
                  <Image
                    src={category.imageUrl}
                    alt={category.nameFr}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 128px, 160px"
                    priority
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subcategories Section - Compact Pills */}
          {category.children.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold tracking-tight mb-6 text-zinc-900">
                Sous-catégories
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.slug}`}
                    className="group"
                  >
                    <div className="bg-white border border-zinc-200/60 rounded-xl p-3 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all text-center shadow-sm">
                      {child.imageUrl ? (
                        <div className="aspect-square w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-zinc-50 relative">
                          <Image
                            src={child.imageUrl}
                            alt={child.nameFr}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-16 h-16 mx-auto mb-2 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-zinc-400" />
                        </div>
                      )}
                      <h3 className="font-medium text-xs group-hover:text-primary transition-colors line-clamp-2 leading-tight text-zinc-900">
                        {child.nameFr}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Products Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Produits</h2>
              {category.products.length > 0 && (
                <span className="text-sm text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
                  {category.products.length} produit{category.products.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {category.products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.products.map((product) => (
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
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center shadow-sm">
                <Package className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-zinc-900">Aucun produit pour le moment</h3>
                <p className="text-sm text-zinc-600 mb-6">
                  Les produits de cette catégorie seront ajoutés prochainement.
                </p>
                <Link href="/admin/categories">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ajouter des produits
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
