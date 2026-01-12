import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const categorySchema = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  slug: z.string().min(1),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || val.startsWith("/uploads/") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:"),
      { message: "URL invalide" }
    )
    .optional()
    .nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export async function GET(req: Request) {
  try {
    // Get session from request cookies
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const cookieHeader = req.headers.get("cookie") || ""
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

    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Only top-level categories
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
        parentId: true,
        sortOrder: true,
        isActive: true,
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
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
    const data = categorySchema.parse(body)

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ce slug existe déjà" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        nameFr: data.nameFr,
        nameAr: data.nameAr || null,
        slug: data.slug,
        imageUrl: data.imageUrl || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

