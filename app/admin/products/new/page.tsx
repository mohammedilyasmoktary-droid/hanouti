import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/admin/product-form"

async function getCategories() {
  return await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      nameFr: true,
      slug: true,
    },
    orderBy: {
      nameFr: "asc",
    },
  })
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau produit</h1>
        <p className="text-muted-foreground mt-1">
          Ajoutez un nouveau produit à votre catalogue
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}


