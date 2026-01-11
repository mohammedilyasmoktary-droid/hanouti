import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/admin/product-form"

async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
  })
}

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

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  // Convert Decimal to number
  const productWithNumber = {
    ...product,
    price: Number(product.price),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier le produit</h1>
        <p className="text-muted-foreground mt-1">
          {product.nameFr}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={productWithNumber} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}


