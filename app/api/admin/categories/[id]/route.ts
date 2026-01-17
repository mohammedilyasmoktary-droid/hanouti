import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  nameFr: z.string().min(1).optional(),
  nameAr: z.string().optional().nullable(),
  slug: z.string().min(1).optional(),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || val.startsWith("/uploads/") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:"),
      { message: "URL invalide" }
    )
    .optional()
    .nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session from request cookies (same approach as upload route)
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Get cookies from request headers
    const cookieHeader = req.headers.get("cookie") || ""
    
    // Try multiple cookie names
    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ]
    
    const { getToken } = await import("next-auth/jwt")
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

    // Parse params and request body
    const { id } = await params
    let body: any
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate and parse the data
    let data: z.infer<typeof updateSchema>
    try {
      data = updateSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0]
        return NextResponse.json(
          { error: firstError?.message || "Données invalides", details: error.issues },
          { status: 400 }
        )
      }
      throw error
    }

    // If slug is being updated, check if it's unique
    if (data.slug) {
      const existing = await prisma.category.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: "Ce slug existe déjà" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    
    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 })
      }
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Cette valeur existe déjà" }, { status: 400 })
      }
    }
    
    // Handle Zod errors (should already be caught above, but just in case)
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { getToken } = await import("next-auth/jwt")
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

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Check if category exists and get counts for info
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 })
    }

    // Use a transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (tx) => {
      // Recursively delete all children and their nested children
      const deleteChildrenRecursive = async (parentId: string) => {
        const children = await tx.category.findMany({
          where: { parentId },
        })
        
        for (const child of children) {
          // Recursively delete grandchildren first
          await deleteChildrenRecursive(child.id)
          // Then delete the child
          await tx.category.delete({
            where: { id: child.id },
          })
        }
      }

      // Delete all children first
      await deleteChildrenRecursive(id)
      
      // Then delete the parent category
      // Products are automatically deleted due to onDelete: Cascade in schema
      await tx.category.delete({
        where: { id },
      })
    })

    return NextResponse.json({ 
      success: true, 
      message: "Catégorie supprimée avec succès",
      deleted: {
        category: category.nameFr,
        subcategories: category._count.children,
        products: category._count.products,
      }
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    
    // Handle Prisma errors
    if (error instanceof Error) {
      // Check for foreign key constraint errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Impossible de supprimer cette catégorie car elle est utilisée ailleurs" },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || "Erreur lors de la suppression" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

