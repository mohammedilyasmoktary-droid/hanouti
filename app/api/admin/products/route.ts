import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const productSchema = z.object({
  nameFr: z.string().min(1, "Le nom français est requis"),
  nameAr: z.string().optional().nullable(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive("Le prix doit être positif"),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || val.startsWith("/uploads/") || val.startsWith("http://") || val.startsWith("https://"),
      { message: "URL invalide" }
    )
    .optional()
    .nullable(),
  categoryId: z.string().min(1, "La catégorie est requise"),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

function generateSlug(nameFr: string): string {
  return nameFr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function GET(req: Request) {
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

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            nameFr: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
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
    const data = productSchema.parse(body)

    // Generate slug from nameFr if not provided
    let slug = data.slug || generateSlug(data.nameFr)
    
    // Ensure slug is unique by appending a number if needed
    let finalSlug = slug
    let counter = 1
    while (true) {
      const existing = await prisma.product.findUnique({
        where: { slug: finalSlug },
      })
      
      if (!existing) {
        break
      }
      
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        nameFr: data.nameFr,
        nameAr: data.nameAr || null,
        slug: finalSlug,
        description: data.description || null,
        price: data.price,
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
        stock: data.stock,
        isActive: data.isActive,
      },
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

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

