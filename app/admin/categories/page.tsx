import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { CategoriesList } from "@/components/admin/categories-list"

export const dynamic = "force-dynamic"

async function getCategories() {
  try {
    if (!prisma) {
      console.error("Prisma client is not available")
      return []
    }
    
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

    // Removed console.log to reduce unnecessary output
    return parentCategories
  } catch (error: any) {
    // Handle all database connection errors gracefully
    const isConnectionError = 
      error?.message?.includes('MaxClientsInSessionMode') ||
      error?.message?.includes('max clients reached') ||
      error?.message?.includes('pool_size') ||
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes('database server') ||
      error?.message?.includes('connection') ||
      error?.code === 'P1001' ||
      error?.code === 'P1000' ||
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientConnectionError'
    
    // Only log detailed errors in development or for non-connection errors
    if (process.env.NODE_ENV === 'development' || !isConnectionError) {
      console.error("Error fetching categories:", error)
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
      })
    } else {
      // For connection errors, just log a brief warning
      console.warn("Database connection error, returning empty categories")
    }
    
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

