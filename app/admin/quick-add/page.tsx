import { prisma } from "@/lib/prisma"
import QuickAddClient from "./quick-add-client"

export const dynamic = "force-dynamic"

async function getLeafCategories() {
  try {
    // Find "Produits laitiers & Œufs" parent category
    const parentCategory = await prisma.category.findFirst({
      where: {
        parentId: null,
        OR: [
          { nameFr: { contains: "laitier", mode: "insensitive" } },
          { nameFr: { contains: "œuf", mode: "insensitive" } },
          { nameFr: { contains: "oeuf", mode: "insensitive" } },
          { slug: "produits-laitiers-oeufs" },
          { slug: "produits-laitiers-et-oeufs" },
        ],
      },
      include: {
        children: {
          include: {
            children: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    if (!parentCategory) {
      return {
        categories: [],
        error: "Catégorie 'Produits laitiers & Œufs' introuvable. Veuillez vérifier que cette catégorie existe.",
      }
    }

    // Filter to only leaf categories (those with no children)
    const leafCategories = parentCategory.children
      .filter((child) => !child.children || child.children.length === 0)
      .map((child) => ({
        id: child.id,
        nameFr: child.nameFr,
        slug: child.slug,
      }))

    return {
      categories: leafCategories,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching leaf categories:", error)
    return {
      categories: [],
      error: error instanceof Error ? error.message : "Erreur lors du chargement des catégories",
    }
  }
}

export default async function QuickAddPage() {
  const { categories, error } = await getLeafCategories()

  return <QuickAddClient categories={categories} initialError={error || undefined} />
}

