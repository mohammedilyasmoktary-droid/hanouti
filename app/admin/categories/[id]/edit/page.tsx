import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getCategory(id: string) {
  try {
    if (!prisma) {
      return null
    }
    return await prisma.category.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

async function getParentCategories(excludeId: string) {
  try {
    if (!prisma) {
      return []
    }
    return await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
        id: { not: excludeId },
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        nameFr: true,
      },
    })
  } catch (error) {
    console.error("Error fetching parent categories:", error)
    return []
  }
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const category = await getCategory(id)
    const parentCategories = category ? await getParentCategories(id) : []

    if (!category) {
      notFound()
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier la catégorie</h1>
        <p className="text-muted-foreground mt-1">Modifier les informations de la catégorie</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} parentCategories={parentCategories} />
        </CardContent>
      </Card>
    </div>
  )
  } catch (error: any) {
    console.error("Error in EditCategoryPage:", error)
    // Return a simple error message instead of crashing
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Erreur</h1>
          <p className="text-muted-foreground mt-1">Impossible de charger la catégorie. Veuillez réessayer.</p>
        </div>
      </div>
    )
  }
}

