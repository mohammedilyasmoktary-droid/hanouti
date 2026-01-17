import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { CategoriesList } from "@/components/admin/categories-list"

export const dynamic = "force-dynamic"

async function getCategories() {
  try {
    // Optimized: Use select instead of include, remove unused fields, limit results
    // Fetch parent categories with minimal nested data
    const parentCategories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      take: 50, // Limit to 50 parent categories for better performance
      select: {
        id: true,
        nameFr: true,
        nameAr: true,
        slug: true,
        imageUrl: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        // Removed createdAt - not displayed in UI
        children: {
          take: 100, // Limit children per parent to 100
          select: {
            id: true,
            nameFr: true,
            nameAr: true,
            slug: true,
            imageUrl: true,
            sortOrder: true,
            isActive: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    })

    return parentCategories
  } catch (error) {
    console.error("Error fetching categories:", error)
    // Return empty array on error to prevent page crash
    return []
  }
}

export default async function AdminCategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
  } catch (error) {
    console.error("Error in AdminCategoriesPage:", error)
    // Continue with empty array
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground mt-1.5">
            Gérez vos catégories et sous-catégories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </Link>
      </div>

      <CategoriesList initialCategories={categories} />
    </div>
  )
}

