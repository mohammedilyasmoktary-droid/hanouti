import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"

// Use ISR - revalidate every 60 seconds for faster page loads
export const revalidate = 60

async function getProduct(slug: string) {
  // During build, database may not be available - return null
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  if (isBuildTime && !process.env.DATABASE_URL) {
    return null
  }

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
  let product: Awaited<ReturnType<typeof getProduct>> | null = null

  try {
    product = await getProduct(slug)
  } catch (error: any) {
    // Handle database connection errors during build
    const isDbConnectionError = 
      error?.message?.includes("Can't reach database") ||
      error?.code === 'P1001' ||
      error?.name === 'PrismaClientInitializationError'
    
    const isBuildTime = !process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build'
    
    // Only log non-database errors and only outside build time
    if (!isDbConnectionError && !isBuildTime) {
      console.error("Error fetching product:", error)
    }
    // If product not found or error, show 404
    product = null
  }

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
                <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-md relative">
                  <Image
                    src={product.imageUrl}
                    alt={product.nameFr}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
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
