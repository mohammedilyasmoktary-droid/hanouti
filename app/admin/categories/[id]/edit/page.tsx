import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getCategory(id: string) {
  return await prisma.category.findUnique({
    where: { id },
  })
}

async function getParentCategories(excludeId: string) {
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
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
}

