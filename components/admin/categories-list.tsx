"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SubCategory {
  id: string
  nameFr: string
  nameAr: string | null
  slug: string
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  _count: { products: number }
}

interface Category {
  id: string
  nameFr: string
  nameAr: string | null
  slug: string
  imageUrl: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  children: SubCategory[]
  _count: { products: number }
}

export function CategoriesList({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null; loading: boolean; error: string | null }>({
    open: false,
    category: null,
    loading: false,
    error: null,
  })

  const handleDelete = (category: Category | SubCategory) => {
    console.log("Delete button clicked for category:", category.nameFr, category.id)
    setDeleteDialog({ open: true, category: category as Category, loading: false, error: null })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.category) return

    setDeleteDialog(prev => ({ ...prev, loading: true, error: null }))

    try {
      const categoryId = deleteDialog.category.id
      console.log("Attempting to delete category:", categoryId)
      
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      let data
      try {
        data = await res.json()
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        const text = await res.text()
        console.error("Response text:", text)
        throw new Error("Erreur de communication avec le serveur")
      }

      console.log("Delete response:", { status: res.status, data })

      if (res.ok) {
        // Success - show what was deleted if available
        if (data?.deleted) {
          console.log("Deleted:", data.deleted)
        }
        // Check if it's a parent category or subcategory
        const isParentCategory = categories.some((c) => c.id === categoryId)
        
        if (isParentCategory) {
          // Remove the parent category
          setCategories(categories.filter((c) => c.id !== categoryId))
        } else {
          // Remove the subcategory from its parent's children array
          setCategories(
            categories.map((parent) => ({
              ...parent,
              children: parent.children.filter((child) => child.id !== categoryId),
            }))
          )
        }
        
        setDeleteDialog({ open: false, category: null, loading: false, error: null })
        // Small delay before reload to show success state
        setTimeout(() => {
          window.location.reload()
        }, 300)
      } else {
        // Error response from server
        const errorMessage = data?.error || `Erreur ${res.status}: ${res.statusText}` || "Impossible de supprimer la catégorie"
        console.error("Delete failed:", errorMessage)
        setDeleteDialog(prev => ({ ...prev, loading: false, error: errorMessage }))
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression"
      setDeleteDialog(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }

  const toggleActive = async (category: Category | SubCategory) => {
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      })

      if (res.ok) {
        setCategories(
          categories.map((c) => {
            if (c.id === category.id) {
              return { ...c, isActive: !c.isActive }
            }
            // Check if it's a subcategory
            const updatedChildren = c.children.map((child) =>
              child.id === category.id ? { ...child, isActive: !child.isActive } : child
            )
            if (updatedChildren.some((child) => child.id === category.id)) {
              return { ...c, children: updatedChildren }
            }
            return c
          })
        )
      }
    } catch (error) {
      console.error("Error toggling category:", error)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{category.nameFr}</div>
                  {category.nameAr && (
                    <div className="text-sm text-muted-foreground mt-1">{category.nameAr}</div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {category.children.length} sous-catégorie{category.children.length > 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {category._count.products} produit{category._count.products > 1 ? "s" : ""}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(category)}
                    className="gap-2"
                  >
                    {category.isActive ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Actif
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Inactif
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Supprimer la catégorie"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {category.children.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="pl-8">Sous-catégorie</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.children.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="pl-8">
                        <div>
                          <div className="font-medium">{subcategory.nameFr}</div>
                          {subcategory.nameAr && (
                            <div className="text-sm text-muted-foreground">{subcategory.nameAr}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{subcategory._count.products}</TableCell>
                      <TableCell>{subcategory.sortOrder}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(subcategory as any)}
                          className="gap-2"
                        >
                          {subcategory.isActive ? (
                            <>
                              <Eye className="h-4 w-4" />
                              Actif
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Inactif
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/categories/${subcategory.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subcategory as any)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Supprimer la sous-catégorie"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ))}
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: null, loading: false, error: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{deleteDialog.category?.nameFr}&quot; ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.category && (
            <div className="space-y-2">
              {((deleteDialog.category.children?.length > 0) || (deleteDialog.category._count?.products > 0)) && (
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 text-sm space-y-2">
                  <div className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Attention</div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    <p>Cette suppression supprimera également :</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {(deleteDialog.category.children?.length > 0) && (
                        <li>{deleteDialog.category.children.length} sous-catégorie(s)</li>
                      )}
                      {(deleteDialog.category._count?.products > 0) && (
                        <li>{deleteDialog.category._count.products} produit(s)</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
              
              {deleteDialog.error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive space-y-2">
                  <div className="font-semibold">❌ Erreur</div>
                  <div>{deleteDialog.error}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, category: null, loading: false, error: null })}
              disabled={deleteDialog.loading}
              type="button"
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log("Delete confirm button clicked")
                confirmDelete()
              }}
              disabled={deleteDialog.loading}
              type="button"
            >
              {deleteDialog.loading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

