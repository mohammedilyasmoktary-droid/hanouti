import { prisma } from "@/lib/prisma"
import { cache } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowRight, Zap, Shield, CreditCard, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/ui/section-header"
import { CategoryCard } from "@/components/cards/category-card"
import { ProductCard } from "@/components/cart/product-card"
import { Card, CardContent } from "@/components/ui/card"

// Use ISR with 60s revalidation for better performance
// Page is optimized to stay under Vercel's size limits
export const revalidate = 60

async function getHomepageContent() {
  try {
    // Check if HomepageContent model exists in schema
    // If not, return empty object (will use defaults)
    if (!prisma) {
      console.warn("Prisma client not available, using defaults")
      return {}
    }

    // During build, database may not be available - silently return empty
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
    if (isBuildTime && !process.env.DATABASE_URL) {
      return {}
    }

    // Try to access the model - if it doesn't exist, this will throw
    // We catch it and return empty object
    const contents = await prisma.homepageContent.findMany({
      where: {
        isActive: true,
      },
    })

    const contentMap: Record<string, any> = {}
    contents.forEach((content) => {
      try {
        contentMap[content.section] = JSON.parse(content.data)
      } catch (e) {
        console.error(`Error parsing content for section ${content.section}:`, e)
      }
    })

    return contentMap
  } catch (error: any) {
    // Handle all Prisma errors gracefully
    // P2001 = Record not found
    // P2025 = Record to update/delete not found
    // Connection pool errors
    const isConnectionPoolError = 
      error?.message?.includes('MaxClientsInSessionMode') ||
      error?.message?.includes('max clients reached') ||
      error?.message?.includes('pool_size') ||
      error?.code === 'P1001'
    
    const isModelError = 
      error?.code === 'P2001' || 
      error?.code === 'P2025' ||
      error?.message?.includes('does not exist') || 
      error?.message?.includes('Unknown model') ||
      error?.message?.includes('homepageContent') ||
      error?.message?.includes('Invalid `prisma.homepageContent.findMany') ||
      error?.message?.includes('Cannot read properties of undefined') ||
      error?.name === 'PrismaClientKnownRequestError' ||
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientUnknownRequestError'
    
    if (isConnectionPoolError || isModelError) {
      // Only log in development, suppress in production to reduce noise
      if (process.env.NODE_ENV === 'development') {
        console.warn("HomepageContent query failed, using defaults:", error?.message || error)
      }
      return {}
    }
    
    // Log other errors but still return empty object to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching homepage content:", error)
    }
    // Always return empty object to prevent crashes
    return {}
  }
}

// Cache the query for request-level memoization
const getFeaturedCategoriesCached = cache(async (categoryIds?: string[]) => {
  return await getFeaturedCategoriesInternal(categoryIds)
})

async function getFeaturedCategoriesInternal(categoryIds?: string[]) {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return []
    }

    const whereClause: any = {
      isActive: true,
      parentId: null, // Top-level categories only
    }

    // If category IDs are provided and not empty, use them; otherwise, fetch all
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      whereClause.id = { in: categoryIds }
    }

    // Limit to maximum 4 categories to reduce page size and keep under Vercel limits
    const maxCategories = (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0)
      ? Math.min(categoryIds.length, 4) 
      : 4

    const categories = await prisma.category.findMany({
      where: whereClause,
      take: maxCategories,
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
    })

    // If category IDs are provided and not empty, sort them in the order specified
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      return categoryIds
        .map((id) => categories.find((cat) => cat.id === id))
        .filter((cat): cat is NonNullable<typeof cat> => cat !== undefined)
    }

    return categories
  } catch (error: any) {
    // Handle connection pool errors gracefully
    const isConnectionPoolError = 
      error?.message?.includes('MaxClientsInSessionMode') ||
      error?.message?.includes('max clients reached') ||
      error?.message?.includes('pool_size') ||
      error?.code === 'P1001' ||
      error?.name === 'PrismaClientInitializationError'
    
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL
    
    // Only log detailed errors in development or for non-connection errors
    if (process.env.NODE_ENV === 'development' || (!isConnectionPoolError && !isBuildTime)) {
      console.error("Database error in getFeaturedCategories:", error)
    } else if (isConnectionPoolError) {
      // For connection pool errors, just log a brief warning
      console.warn("Database connection pool error in getFeaturedCategories, using empty categories")
    }
    
    // Always return empty array to prevent crashes
    return []
  }
}

// Cache the query for request-level memoization
const getPopularProductsCached = cache(async () => {
  return await getPopularProductsInternal()
})

async function getPopularProductsInternal() {
  try {
    if (!prisma) {
      console.warn("Prisma client not available")
      return []
    }

    // Fetch products - limit to 4 to reduce page size
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          gt: 0, // Only products in stock
        },
      },
      take: 4, // Limited to 4 products to reduce page size
      orderBy: {
        createdAt: "desc", // Latest products first
      },
      select: {
        id: true,
        nameFr: true,
        slug: true,
        price: true,
        imageUrl: true,
      },
    })
    
    return products
  } catch (error: any) {
    // Handle errors gracefully - only log if not a build-time database error
    const isDbConnectionError = 
      error?.message?.includes("Can't reach database") ||
      error?.code === 'P1001' ||
      error?.name === 'PrismaClientInitializationError'
    
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL
    
    if (!isDbConnectionError && !isBuildTime) {
      console.error("Database error in getPopularProducts:", error)
    }
    // Always return empty array to prevent crashes
    return []
  }
}

// Export cached functions for type inference
async function getFeaturedCategories(categoryIds?: string[]) {
  return getFeaturedCategoriesCached(categoryIds)
}

async function getPopularProducts() {
  return getPopularProductsCached()
}

export default async function HomePage() {
  let featuredCategories: Awaited<ReturnType<typeof getFeaturedCategories>> = []
  let popularProducts: Awaited<ReturnType<typeof getPopularProducts>> = []
  let homepageContent: Awaited<ReturnType<typeof getHomepageContent>> = {}

  try {
    homepageContent = await getHomepageContent()
    // Get categoryIds from homepage content, but ensure we always fetch categories if none specified
    const categoryIds = homepageContent.categories?.categoryIds
    // Always fetch categories - if categoryIds is empty/undefined, it will fetch first 8
    featuredCategories = await getFeaturedCategories(categoryIds)
    popularProducts = await getPopularProducts()
  } catch (error: any) {
    // Silently handle errors during build time - pages will render at runtime
    // Check if it's a database connection error (common during build)
    const isDbConnectionError = 
      error?.message?.includes("Can't reach database") ||
      error?.code === 'P1001' ||
      error?.name === 'PrismaClientInitializationError'
    
    const isBuildTime = !process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build'
    
    // Only log non-database errors and only outside build time
    if (!isDbConnectionError && !isBuildTime) {
      console.error("Error fetching data:", error)
      if (error?.message) {
        console.error("Error message:", error.message)
      }
    }
    // Continue with empty arrays if database error - page will render with empty state
  }

  // Get content for each section with defaults
  const heroContent = homepageContent.hero || {
    title: "Bienvenue chez Hanouti",
    subtitle: "Vos produits frais livrés à domicile",
    searchPlaceholder: "Rechercher des produits frais... / البحث عن منتجات طازجة...",
    ctaText: "Commencer les achats",
  }

  const categoriesContent = homepageContent.categories || {
    title: "Nos catégories",
    subtitle: "Découvrez notre sélection",
    actionLabel: "Voir tout",
    actionHref: "/categories",
    categoryIds: [], // Array of category IDs to display
  }

  const productsContent = homepageContent.products || {
    title: "Produits populaires",
    subtitle: "Découvrez nos produits les plus récents",
    actionLabel: "Voir tous les produits",
    actionHref: "/categories",
  }

  const promosContent = homepageContent.promos || {
    title: "Promos & Bons plans",
    subtitle: "Profitez de nos offres spéciales",
    promos: [
      {
        badge: "NOUVEAU",
        badgeColor: "primary",
        title: "Livraison gratuite",
        description: "Commandez pour plus de 200 MAD et bénéficiez de la livraison gratuite à Casablanca",
        buttonText: "Commander maintenant",
        buttonLink: "/categories",
        gradient: "from-primary/5 to-primary/10",
      },
      {
        badge: "LIMITÉ",
        badgeColor: "green",
        title: "Produits frais garantis",
        description: "100% produits locaux, récoltés quotidiennement. Fraîcheur garantie ou remboursé",
        buttonText: "Découvrir nos produits",
        buttonLink: "/categories",
        gradient: "from-green-50 to-green-100/50",
      },
    ],
  }

  const trustContent = homepageContent.trust || {
    title: "Pourquoi Hanouti ?",
    subtitle: "Votre confiance est notre priorité",
    badges: [
      {
        icon: "zap",
        title: "Livraison rapide",
        description: "Réception de votre commande sous 24h à Casablanca",
      },
      {
        icon: "shield",
        title: "Fraîcheur garantie",
        description: "Produits locaux sélectionnés, récoltés au quotidien",
      },
      {
        icon: "creditCard",
        title: "Paiement à la livraison",
        description: "Payez uniquement lorsque vous recevez votre commande",
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-accent/30 to-primary/5 py-12 sm:py-16">
          <Container>
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-semibold mb-4 text-zinc-900 tracking-tight">
                {heroContent.title}
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
                {heroContent.subtitle}
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-6">
                <form action="/search" method="get" className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      name="q"
                      placeholder={heroContent.searchPlaceholder}
                      className="w-full px-4 py-3 pl-12 pr-4 rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all text-sm"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  </div>
                  <Button type="submit" size="lg" className="rounded-xl">
                    Rechercher
                  </Button>
                </form>
              </div>

              <Link href="/categories">
                <Button size="lg" variant="default" className="text-base px-8 rounded-xl">
                  {heroContent.ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Featured Categories Section */}
        <section className="py-12 bg-white">
          <Container>
            <SectionHeader
              title={categoriesContent.title}
              subtitle={categoriesContent.subtitle}
              action={{
                label: categoriesContent.actionLabel,
                href: categoriesContent.actionHref || "/categories"
              }}
            />
            {featuredCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
                <CardContent className="py-12 text-center">
                  <p className="text-sm text-zinc-600">
                    Les catégories seront bientôt disponibles.
                  </p>
                </CardContent>
              </Card>
            )}
          </Container>
        </section>

        {/* Popular Products Section */}
        <section className="py-12 bg-zinc-50 border-t border-zinc-200">
          <Container>
            <SectionHeader
              title={productsContent.title}
              subtitle={productsContent.subtitle}
              action={{
                label: productsContent.actionLabel,
                href: productsContent.actionHref || "/categories"
              }}
            />
            {popularProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {popularProducts.map((product) => (
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
              <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
                <CardContent className="py-12 text-center">
                  <p className="text-sm text-zinc-600 mb-4">
                    Aucun produit disponible pour le moment.
                  </p>
                  <Link href="/categories">
                    <Button variant="outline" className="rounded-xl">
                      Parcourir les catégories
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </Container>
        </section>

        {/* Promos & Bons plans Section */}
        <section className="py-12 bg-white border-t border-zinc-200">
          <Container>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-1 text-zinc-900">
                {promosContent.title}
              </h2>
              <p className="text-sm text-zinc-600">
                {promosContent.subtitle}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {promosContent.promos?.slice(0, 2).map((promo: any, index: number) => {
                const isPrimary = promo.badgeColor === "primary" || index === 0
                const gradientClass = promo.gradient || (isPrimary ? "from-primary/5 to-primary/10" : "from-green-50 to-green-100/50")
                const badgeClass = isPrimary ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-700"
                const IconComponent = index === 0 ? Sparkles : Zap

                return (
                  <Card key={index} className={`border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 ${badgeClass}`}>
                            <IconComponent className={`h-4 w-4 ${isPrimary ? "text-primary" : "text-green-600"}`} />
                            <span className={`text-xs font-semibold ${isPrimary ? "text-primary" : "text-green-700"}`}>{promo.badge}</span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-zinc-900">
                            {promo.title}
                          </h3>
                          <p className="text-sm text-zinc-600 mb-4">
                            {promo.description}
                          </p>
                        </div>
                      </div>
                      <Link href={promo.buttonLink || "/categories"}>
                        <Button className={isPrimary ? "w-full rounded-xl" : "w-full rounded-xl border-green-200 hover:bg-green-50"} variant={isPrimary ? "default" : "outline"} size="lg">
                          {promo.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Pourquoi Hanouti Section */}
        <section className="py-12 bg-zinc-50 border-t border-zinc-200">
          <Container>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight mb-1 text-zinc-900">
                {trustContent.title}
              </h2>
              <p className="text-sm text-zinc-600">
                {trustContent.subtitle}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {trustContent.badges?.slice(0, 3).map((badge: any, index: number) => {
                const iconMap: Record<string, typeof Zap> = {
                  zap: Zap,
                  shield: Shield,
                  creditCard: CreditCard,
                }
                const IconComponent = iconMap[badge.icon] || Zap

                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2 text-zinc-900">{badge.title}</h3>
                    <p className="text-sm text-zinc-600">
                      {badge.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  )
}
