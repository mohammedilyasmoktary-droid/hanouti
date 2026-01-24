"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Edit, Trash2, Eye, EyeOff, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Product {
  id: string
  nameFr: string
  nameAr: string | null
  slug: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  isActive: boolean
  category: {
    id: string
    nameFr: string
    slug: string
  }
}

interface ProductsListProps {
  initialProducts: Product[]
  currentPage?: number
  totalPages?: number
  totalProducts?: number
  categoryId?: string
}

export function ProductsList({ 
  initialProducts, 
  currentPage = 1, 
  totalPages = 1,
  totalProducts = 0,
  categoryId 
}: ProductsListProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null; loading: boolean; error: string | null }>({
    open: false,
    product: null,
    loading: false,
    error: null,
  })

  // Update products when initialProducts changes (e.g., when page changes)
  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts, currentPage])

  const handleDelete = (product: Product) => {
    console.log("Delete button clicked for product:", product.nameFr, product.id)
    setDeleteDialog({ open: true, product, loading: false, error: null })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.product) return

    setDeleteDialog(prev => ({ ...prev, loading: true, error: null }))

    try {
      const productId = deleteDialog.product.id
      console.log("Attempting to delete product:", productId)
      
      const res = await fetch(`/api/admin/products/${productId}`, {
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
        setProducts(products.filter((p) => p.id !== productId))
        setDeleteDialog({ open: false, product: null, loading: false, error: null })
        setTimeout(() => {
          router.refresh()
        }, 300)
      } else {
        const errorMessage = data?.error || `Erreur ${res.status}: ${res.statusText}` || "Impossible de supprimer le produit"
        console.error("Delete failed:", errorMessage)
        setDeleteDialog(prev => ({ ...prev, loading: false, error: errorMessage }))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression"
      setDeleteDialog(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      })

      if (res.ok) {
        setProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, isActive: !p.isActive } : p
          )
        )
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling product:", error)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30">
              <TableHead className="font-semibold">Produit</TableHead>
              <TableHead className="font-semibold">Catégorie</TableHead>
              <TableHead className="font-semibold">Prix</TableHead>
              <TableHead className="font-semibold">Stock</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-accent/50 transition-colors group">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border shadow-sm">
                        <img
                          src={product.imageUrl}
                          alt={product.nameFr}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground truncate">{product.nameFr}</div>
                      {product.nameAr && (
                        <div className="text-sm text-muted-foreground truncate">{product.nameAr}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Link
                    href={`/admin/categories/${product.category.id}/edit`}
                    className="text-sm text-primary hover:underline font-medium transition-colors"
                  >
                    {product.category.nameFr}
                  </Link>
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-semibold text-foreground">{product.price.toFixed(2)} MAD</span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant={product.stock > 0 ? "default" : "secondary"} className="font-medium">
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(product)}
                    className="gap-2 hover:bg-accent hover:text-accent-foreground active:bg-accent/80 transition-all"
                    type="button"
                  >
                    {product.isActive ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">Actif</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span className="font-medium">Inactif</span>
                      </>
                    )}
                  </Button>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/products/${product.id}/edit`} className="inline-flex">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-accent hover:text-accent-foreground active:bg-accent/80 transition-all"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Éditer</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all"
                      title="Supprimer le produit"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} ({totalProducts} produit{totalProducts > 1 ? "s" : ""})
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/products?${categoryId ? `category=${categoryId}&` : ""}page=${Math.max(1, currentPage - 1)}`}
            >
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
            </Link>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Link
                    key={pageNum}
                    href={`/admin/products?${categoryId ? `category=${categoryId}&` : ""}page=${pageNum}`}
                  >
                    <Button
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                )
              })}
            </div>
            <Link
              href={`/admin/products?${categoryId ? `category=${categoryId}&` : ""}page=${Math.min(totalPages, currentPage + 1)}`}
            >
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null, loading: false, error: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{deleteDialog.product?.nameFr}&quot; ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive space-y-2">
              <div className="font-semibold">❌ Erreur</div>
              <div>{deleteDialog.error}</div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, product: null, loading: false, error: null })}
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

