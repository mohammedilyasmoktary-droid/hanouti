import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Checking specific category and products...\n")

  // Check "Lait" category specifically
  const laitCategory = await prisma.category.findUnique({
    where: { slug: "lait" },
    include: {
      products: {
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
      },
    },
  })

  if (!laitCategory) {
    console.error("❌ Category 'Lait' not found!")
    return
  }

  console.log(`📦 Category: ${laitCategory.nameFr}`)
  console.log(`   Image URL: ${laitCategory.imageUrl || "NULL"}`)
  console.log(`   isActive: ${laitCategory.isActive}`)
  console.log(`   Total products in DB: ${laitCategory.products.length}\n`)

  console.log("📋 All products in this category:")
  laitCategory.products.forEach((product, index) => {
    const isOld = new Date(product.createdAt) < new Date("2026-01-16")
    const dateStr = new Date(product.createdAt).toISOString()
    console.log(`   ${index + 1}. ${product.nameFr}`)
    console.log(`      - Slug: ${product.slug}`)
    console.log(`      - isActive: ${product.isActive}`)
    console.log(`      - Created: ${dateStr}`)
    console.log(`      - Image: ${product.imageUrl ? "YES" : "NO"}`)
    console.log(`      - ${isOld ? "⚠️  OLD PRODUCT" : "✅ NEW PRODUCT"}`)
    console.log()
  })

  // Check how many would be returned with the page query
  const pageQueryProducts = await prisma.product.findMany({
    where: {
      categoryId: laitCategory.id,
      isActive: true,
    },
    take: 50,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      nameFr: true,
      slug: true,
      isActive: true,
      createdAt: true,
    },
  })

  console.log(`\n📊 Products returned by page query (isActive=true, take=50, newest first): ${pageQueryProducts.length}`)
  pageQueryProducts.forEach((p, i) => {
    const isOld = new Date(p.createdAt) < new Date("2026-01-16")
    console.log(`   ${i + 1}. ${p.nameFr} ${isOld ? "⚠️  OLD" : "✅ NEW"} - Active: ${p.isActive}`)
  })

  // Check parent category images
  const parent = await prisma.category.findUnique({
    where: { id: laitCategory.parentId || "" },
    select: {
      nameFr: true,
      slug: true,
      imageUrl: true,
    },
  })

  if (parent) {
    console.log(`\n📸 Parent category (${parent.nameFr}):`)
    console.log(`   Image URL: ${parent.imageUrl || "NULL"}`)
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






