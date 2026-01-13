"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface Category {
  id: string
  nameFr: string
  slug: string
}

interface QuickAddClientProps {
  categories: Category[]
  initialError?: string
}

export default function QuickAddClient({ categories: initialCategories, initialError }: QuickAddClientProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    initialError ? { type: "error", text: initialError } : null
  )

  const handleQuickAdd = async () => {
    if (!selectedCategoryId) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner une sous-catégorie",
      })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch("/api/admin/quick-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création des produits")
      }

      setMessage({
        type: "success",
        text: `✅ ${data.message || `${data.total} produits créés avec succès`}`,
      })

      // Clear selection after success
      setSelectedCategoryId("")
      
      // Optionally refresh the page after a delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error in quick-add:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur lors de la création des produits",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCategory = initialCategories.find((cat) => cat.id === selectedCategoryId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajout rapide de produits</h1>
        <p className="text-muted-foreground mt-1.5">
          Créez rapidement 4 produits de démarrage pour une sous-catégorie de "Produits laitiers & Œufs"
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter des produits</CardTitle>
          <CardDescription>
            Sélectionnez une sous-catégorie finale (sans sous-catégories) pour créer automatiquement 4 produits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sous-catégorie</label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={submitting || initialCategories.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une sous-catégorie" />
              </SelectTrigger>
              <SelectContent>
                {initialCategories.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucune sous-catégorie disponible
                  </SelectItem>
                ) : (
                  initialCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nameFr}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {initialCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune sous-catégorie finale trouvée sous "Produits laitiers & Œufs".
              </p>
            )}
          </div>

          {selectedCategory && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">Sous-catégorie sélectionnée:</p>
              <p className="text-sm text-muted-foreground">
                {selectedCategory.nameFr}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                4 produits seront créés pour cette catégorie (ou mis à jour s'ils existent déjà).
              </p>
            </div>
          )}

          {message && (
            <div
              className={`flex items-center gap-2 rounded-lg border p-4 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100"
                  : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <Button
            onClick={handleQuickAdd}
            disabled={!selectedCategoryId || submitting || initialCategories.length === 0}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Ajouter 4 produits de démarrage"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

