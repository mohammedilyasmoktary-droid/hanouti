import { prisma } from "@/lib/prisma"
import { CategoryForm } from "@/components/admin/category-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getParentCategories() {
  return await prisma.category.findMany({
    where: {
      parentId: null,
      isActive: true,
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

export default async function NewCategoryPage() {
  const parentCategories = await getParentCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle catégorie</h1>
        <p className="text-muted-foreground mt-1">Créer une nouvelle catégorie ou sous-catégorie</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm parentCategories={parentCategories} />
        </CardContent>
      </Card>
    </div>
  )
}

