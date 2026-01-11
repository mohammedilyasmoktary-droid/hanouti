import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"

export const revalidate = 60

async function getProduct(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          nameFr: true,
          slug: true,
        },
      },
    },
  })
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            {product.category && (
              <>
                {" / "}
                <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground transition-colors">
                  {product.category.nameFr}
                </Link>
              </>
            )}
            {" / "}
            <span className="text-foreground">{product.nameFr}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Product Image */}
            <div>
              {product.imageUrl ? (
                <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-md">
                  <img
                    src={product.imageUrl}
                    alt={product.nameFr}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center shadow-sm">
                  <Package className="h-24 w-24 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-sm text-primary hover:underline mb-2 inline-block font-medium"
                >
                  {product.category.nameFr}
                </Link>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">{product.nameFr}</h1>
              {product.description && (
                <p className="text-muted-foreground mb-6 text-base sm:text-lg leading-relaxed">{product.description}</p>
              )}
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-primary">
                  {Number(product.price).toFixed(2)} MAD
                </span>
              </div>
              {product.stock > 0 ? (
                <div className="mt-auto">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      nameFr: product.nameFr,
                      price: Number(product.price),
                      imageUrl: product.imageUrl,
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    En stock ({product.stock} disponibles)
                  </p>
                </div>
              ) : (
                <div className="mt-auto">
                  <Button size="lg" className="w-full" disabled>
                    Rupture de stock
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
