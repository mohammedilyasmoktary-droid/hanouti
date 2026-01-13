import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const quickAddSchema = z.object({
  categoryId: z.string().min(1, "La catégorie est requise"),
})

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

export async function POST(req: Request) {
  try {
    // Get session from request cookies
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const cookieHeader = req.headers.get("cookie") || ""
    
    // Try multiple cookie names
    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ]
    
    let token: any = null
    for (const cookieName of cookieNames) {
      try {
        token = await getToken({
          req: {
            headers: {
              cookie: cookieHeader,
            },
          } as any,
          secret,
          cookieName,
        })
        if (token) break
      } catch (e) {
        continue
      }
    }

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { categoryId } = quickAddSchema.parse(body)

    // Verify category exists and is a leaf category (no children)
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 }
      )
    }

    // Check if category has children (not a leaf)
    if (category.children.length > 0) {
      return NextResponse.json(
        { error: "Cette catégorie a des sous-catégories. Veuillez sélectionner une sous-catégorie finale." },
        { status: 400 }
      )
    }

    // Get category slug and name to find matching template
    const categorySlug = category.slug.toLowerCase()
    const categoryName = category.nameFr.toLowerCase()
    let templateKey: string | null = null

    // Map category slugs/names to template keys (flexible matching)
    if (categorySlug.includes("lait") && !categorySlug.includes("laitier")) {
      templateKey = "lait"
    } else if (categorySlug.includes("lben") || categorySlug.includes("raib") || categoryName.includes("lben") || categoryName.includes("raib")) {
      templateKey = "lben-raib"
    } else if (categorySlug.includes("yaourt") || categoryName.includes("yaourt")) {
      templateKey = "yaourts"
    } else if (categorySlug.includes("fromage") || categoryName.includes("fromage")) {
      templateKey = "fromages"
    } else if (categorySlug.includes("beurre") || categorySlug.includes("creme") || categorySlug.includes("crème") || categoryName.includes("beurre") || categoryName.includes("crème")) {
      templateKey = "beurre-creme"
    } else if (categorySlug.includes("oeuf") || categorySlug.includes("œuf") || categoryName.includes("oeuf") || categoryName.includes("œuf")) {
      templateKey = "oeufs"
    }

    if (!templateKey || !PRODUCT_TEMPLATES[templateKey]) {
      return NextResponse.json(
        { error: "Aucun modèle de produits disponible pour cette catégorie" },
        { status: 400 }
      )
    }

    const templates = PRODUCT_TEMPLATES[templateKey]
    const createdProducts = []
    const updatedProducts = []

    // Create or update each product using upsert by slug
    for (const template of templates) {
      const slug = generateSlug(template.nameFr, template.brand, template.size)
      
      // Ensure slug is unique by appending a number if needed
      let finalSlug = slug
      let counter = 1
      while (true) {
        const existing = await prisma.product.findUnique({
          where: { slug: finalSlug },
        })
        
        if (!existing || existing.categoryId === categoryId) {
          break
        }
        
        finalSlug = `${slug}-${counter}`
        counter++
      }

      // Check if product already exists in this category
      const existing = await prisma.product.findFirst({
        where: {
          slug: finalSlug,
          categoryId: categoryId,
        },
      })

      if (existing) {
        // Update existing product
        const updated = await prisma.product.update({
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
        updatedProducts.push(updated)
      } else {
        // Create new product
        const created = await prisma.product.create({
          data: {
            nameFr: template.nameFr,
            slug: finalSlug,
            description: template.description,
            price: template.price,
            categoryId: categoryId,
            stock: 50,
            isActive: true,
            imageUrl: `https://via.placeholder.com/400x400?text=${encodeURIComponent(template.nameFr)}`,
          },
        })
        createdProducts.push(created)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length} produits créés, ${updatedProducts.length} produits mis à jour`,
      created: createdProducts.length,
      updated: updatedProducts.length,
      total: createdProducts.length + updatedProducts.length,
    })
  } catch (error) {
    console.error("Error in quick-add:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

