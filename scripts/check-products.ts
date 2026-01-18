import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Checking products in database...\n")

  // Get all products
  const allProducts = await prisma.product.findMany({
    include: {
      category: {
        select: {
          nameFr: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  console.log(`📊 Total products in database: ${allProducts.length}\n`)

  // Group by category
  const productsByCategory = new Map<string, typeof allProducts>()
  for (const product of allProducts) {
    const categoryName = product.category.nameFr
    if (!productsByCategory.has(categoryName)) {
      productsByCategory.set(categoryName, [])
    }
    productsByCategory.get(categoryName)!.push(product)
  }

  console.log("📦 Products by category:")
  for (const [categoryName, products] of productsByCategory.entries()) {
    console.log(`\n  ${categoryName} (${products.length} products):`)
    products.slice(0, 5).forEach((p) => {
      console.log(`    - ${p.nameFr} (${p.slug}) - Created: ${p.createdAt.toISOString()}`)
    })
    if (products.length > 5) {
      console.log(`    ... and ${products.length - 5} more`)
    }
  }

  // Check creation dates
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const recentProducts = allProducts.filter(
    (p) => new Date(p.createdAt) >= yesterday
  )

  const oldProducts = allProducts.filter(
    (p) => new Date(p.createdAt) < yesterday
  )

  console.log(`\n📅 Creation date analysis:`)
  console.log(`   - Products created in last 24h: ${recentProducts.length}`)
  console.log(`   - Products created before that: ${oldProducts.length}`)

  if (oldProducts.length > 0) {
    console.log(`\n⚠️  Found ${oldProducts.length} products created before today:`)
    oldProducts.slice(0, 10).forEach((p) => {
      console.log(`   - ${p.nameFr} (${p.category.nameFr}) - Created: ${p.createdAt.toISOString()}`)
    })
    if (oldProducts.length > 10) {
      console.log(`   ... and ${oldProducts.length - 10} more`)
    }
  }

  console.log("\n✅ Check complete!")
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





