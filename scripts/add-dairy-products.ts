import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Product templates for each subcategory
const PRODUCT_TEMPLATES: Record<string, Array<{
  nameFr: string
  brand: string
  size: string
  price: number
  description: string
}>> = {
  "lait": [
    {
      nameFr: "Lait UHT demi-écrémé",
      brand: "Centrale Danone",
      size: "1 L",
      price: 9.50,
      description: "Lait UHT demi-écrémé — Centrale Danone — 1 L",
    },
    {
      nameFr: "Lait entier UHT",
      brand: "Jaouda",
      size: "1 L",
      price: 9.90,
      description: "Lait entier UHT — Jaouda — 1 L",
    },
    {
      nameFr: "Lait chocolaté",
      brand: "Candia",
      size: "1 L",
      price: 15.90,
      description: "Lait chocolaté — Candia — 1 L",
    },
    {
      nameFr: "Lait sans lactose",
      brand: "Candia",
      size: "1 L",
      price: 18.90,
      description: "Lait sans lactose — Candia — 1 L",
    },
  ],
  "lben-raib": [
    {
      nameFr: "Lben",
      brand: "Jaouda",
      size: "1 L",
      price: 12.90,
      description: "Lben — Jaouda — 1 L",
    },
    {
      nameFr: "Lben",
      brand: "Centrale Danone",
      size: "1 L",
      price: 12.50,
      description: "Lben — Centrale Danone — 1 L",
    },
    {
      nameFr: "Raib nature",
      brand: "Jaouda",
      size: "110 g",
      price: 3.50,
      description: "Raib nature — Jaouda — 110 g",
    },
    {
      nameFr: "Raib vanille",
      brand: "Centrale Danone",
      size: "110 g",
      price: 3.90,
      description: "Raib vanille — Centrale Danone — 110 g",
    },
  ],
  "yaourts": [
    {
      nameFr: "Yaourt nature",
      brand: "Centrale Danone",
      size: "4x110 g",
      price: 13.90,
      description: "Yaourt nature — Centrale Danone — 4x110 g",
    },
    {
      nameFr: "Yaourt fraise",
      brand: "Jaouda",
      size: "4x110 g",
      price: 14.90,
      description: "Yaourt fraise — Jaouda — 4x110 g",
    },
    {
      nameFr: "Yaourt grec nature",
      brand: "Danone",
      size: "150 g",
      price: 6.90,
      description: "Yaourt grec nature — Danone — 150 g",
    },
    {
      nameFr: "Yaourt à boire fraise",
      brand: "Danone",
      size: "300 ml",
      price: 9.90,
      description: "Yaourt à boire fraise — Danone — 300 ml",
    },
  ],
  "fromages": [
    {
      nameFr: "Fromage fondu portions",
      brand: "La Vache qui rit",
      size: "16 portions",
      price: 29.90,
      description: "Fromage fondu portions — La Vache qui rit — 16 portions",
    },
    {
      nameFr: "Tranches burger",
      brand: "Président",
      size: "200 g",
      price: 24.90,
      description: "Tranches burger — Président — 200 g",
    },
    {
      nameFr: "Fromage frais",
      brand: "Kiri",
      size: "8 portions",
      price: 24.90,
      description: "Fromage frais — Kiri — 8 portions",
    },
    {
      nameFr: "Edam en bloc",
      brand: "Président",
      size: "250 g",
      price: 34.90,
      description: "Edam en bloc — Président — 250 g",
    },
  ],
  "beurre-creme": [
    {
      nameFr: "Beurre doux",
      brand: "Président",
      size: "200 g",
      price: 24.90,
      description: "Beurre doux — Président — 200 g",
    },
    {
      nameFr: "Beurre demi-sel",
      brand: "Président",
      size: "200 g",
      price: 26.90,
      description: "Beurre demi-sel — Président — 200 g",
    },
    {
      nameFr: "Crème liquide",
      brand: "Centrale Danone",
      size: "200 ml",
      price: 9.90,
      description: "Crème liquide — Centrale Danone — 200 ml",
    },
    {
      nameFr: "Crème cuisine",
      brand: "Elle & Vire",
      size: "200 ml",
      price: 14.90,
      description: "Crème cuisine — Elle & Vire — 200 ml",
    },
  ],
  "oeufs": [
    {
      nameFr: "Œufs frais",
      brand: "Local",
      size: "boîte de 6",
      price: 14.90,
      description: "Œufs frais — Local — boîte de 6",
    },
    {
      nameFr: "Œufs frais",
      brand: "Local",
      size: "boîte de 12",
      price: 27.90,
      description: "Œufs frais — Local — boîte de 12",
    },
    {
      nameFr: "Œufs bio",
      brand: "Local",
      size: "boîte de 6",
      price: 24.90,
      description: "Œufs bio — Local — boîte de 6",
    },
    {
      nameFr: "Œufs gros calibre",
      brand: "Local",
      size: "boîte de 12",
      price: 32.90,
      description: "Œufs gros calibre — Local — boîte de 12",
    },
  ],
}

function generateSlug(nameFr: string, brand: string, size: string): string {
  const base = `${nameFr} ${brand} ${size}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return base
}

async function main() {
  console.log("🌱 Adding products to 'Produits laitiers & Œufs' categories...\n")

  try {
    // Find "Produits laitiers & Œufs" parent category
    const parentCategory = await prisma.category.findFirst({
      where: {
        parentId: null,
        OR: [
          { nameFr: { contains: "laitier", mode: "insensitive" } },
          { nameFr: { contains: "œuf", mode: "insensitive" } },
          { nameFr: { contains: "oeuf", mode: "insensitive" } },
          { slug: "produits-laitiers-oeufs" },
          { slug: "produits-laitiers-et-oeufs" },
        ],
      },
      include: {
        children: {
          include: {
            children: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    if (!parentCategory) {
      console.error("❌ Category 'Produits laitiers & Œufs' not found!")
      return
    }

    console.log(`✅ Found parent category: ${parentCategory.nameFr}\n`)

    // Filter to only leaf categories (those with no children)
    const leafCategories = parentCategory.children.filter(
      (child) => !child.children || child.children.length === 0
    )

    if (leafCategories.length === 0) {
      console.error("❌ No leaf categories found!")
      return
    }

    console.log(`📋 Found ${leafCategories.length} leaf categories:\n`)
    leafCategories.forEach((cat) => {
      console.log(`  - ${cat.nameFr} (${cat.slug})`)
    })
    console.log()

    let totalCreated = 0
    let totalUpdated = 0

    // Process each leaf category
    for (const category of leafCategories) {
      const categorySlug = category.slug.toLowerCase()
      const categoryName = category.nameFr.toLowerCase()
      let templateKey: string | null = null

      // Map category slugs/names to template keys
      if (categorySlug.includes("lait") && !categorySlug.includes("laitier")) {
        templateKey = "lait"
      } else if (
        categorySlug.includes("lben") ||
        categorySlug.includes("raib") ||
        categoryName.includes("lben") ||
        categoryName.includes("raib")
      ) {
        templateKey = "lben-raib"
      } else if (
        categorySlug.includes("yaourt") ||
        categoryName.includes("yaourt")
      ) {
        templateKey = "yaourts"
      } else if (
        categorySlug.includes("fromage") ||
        categoryName.includes("fromage")
      ) {
        templateKey = "fromages"
      } else if (
        categorySlug.includes("beurre") ||
        categorySlug.includes("creme") ||
        categorySlug.includes("crème") ||
        categoryName.includes("beurre") ||
        categoryName.includes("crème")
      ) {
        templateKey = "beurre-creme"
      } else if (
        categorySlug.includes("oeuf") ||
        categorySlug.includes("œuf") ||
        categoryName.includes("oeuf") ||
        categoryName.includes("œuf")
      ) {
        templateKey = "oeufs"
      }

      if (!templateKey || !PRODUCT_TEMPLATES[templateKey]) {
        console.log(`⚠️  No template found for: ${category.nameFr} (${categorySlug})`)
        continue
      }

      const templates = PRODUCT_TEMPLATES[templateKey]
      console.log(`\n📦 Processing: ${category.nameFr}`)
      console.log(`   Template: ${templateKey} (${templates.length} products)`)

      let created = 0
      let updated = 0

      for (const template of templates) {
        const slug = generateSlug(template.nameFr, template.brand, template.size)

        // Ensure slug is unique by appending a number if needed
        let finalSlug = slug
        let counter = 1
        while (true) {
          const existing = await prisma.product.findUnique({
            where: { slug: finalSlug },
          })

          if (!existing || existing.categoryId === category.id) {
            break
          }

          finalSlug = `${slug}-${counter}`
          counter++
        }

        // Check if product already exists in this category
        const existing = await prisma.product.findFirst({
          where: {
            slug: finalSlug,
            categoryId: category.id,
          },
        })

        if (existing) {
          // Update existing product
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              nameFr: template.nameFr,
              description: template.description,
              price: template.price,
              stock: 50,
              isActive: true,
              imageUrl: `https://via.placeholder.com/400x400?text=${encodeURIComponent(template.nameFr)}`,
            },
          })
          updated++
          console.log(`   ✓ Updated: ${template.nameFr}`)
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              nameFr: template.nameFr,
              slug: finalSlug,
              description: template.description,
              price: template.price,
              categoryId: category.id,
              stock: 50,
              isActive: true,
              imageUrl: `https://via.placeholder.com/400x400?text=${encodeURIComponent(template.nameFr)}`,
            },
          })
          created++
          console.log(`   ✓ Created: ${template.nameFr}`)
        }
      }

      totalCreated += created
      totalUpdated += updated
      console.log(`   Summary: ${created} created, ${updated} updated`)
    }

    console.log(`\n✅ Done!`)
    console.log(`   Total: ${totalCreated} created, ${totalUpdated} updated`)
    console.log(`   Grand total: ${totalCreated + totalUpdated} products\n`)
  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })

