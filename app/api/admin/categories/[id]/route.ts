import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
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
    const session = await getServerSession()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = updateSchema.parse(body)

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
    const session = await getServerSession()
    if (!session?.user || session.user.role !== "ADMIN") {
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

