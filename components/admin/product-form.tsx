"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, Image as ImageIcon } from "lucide-react"

const productSchema = z.object({
  nameFr: z.string().min(1, "Le nom français est requis"),
  nameAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().positive("Le prix doit être positif"),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.string().min(1, "La catégorie est requise"),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: {
    id: string
    nameFr: string
    nameAr: string | null
    slug: string
    description: string | null
    price: number
    imageUrl: string | null
    categoryId: string
    stock: number
    isActive: boolean
  }
  categories: { id: string; nameFr: string; slug: string }[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameFr: product?.nameFr || "",
      nameAr: product?.nameAr || "",
      description: product?.description || "",
      price: product?.price || 0,
      imageUrl: product?.imageUrl || "",
      categoryId: product?.categoryId || "",
      stock: product?.stock ?? 0,
      isActive: product?.isActive ?? true,
    },
  })

  const currentImageUrl = form.watch("imageUrl")
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null)
  
  // Update preview when form value or product changes
  useEffect(() => {
    setImagePreview(currentImageUrl || null)
  }, [currentImageUrl])
  
  useEffect(() => {
    if (product?.imageUrl) {
      setImagePreview(product.imageUrl)
    }
  }, [product?.imageUrl])

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true)
    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products"
      const method = product ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrl: data.imageUrl || null,
        }),
      })

      if (res.ok) {
        router.back()
        router.refresh()
      } else {
        const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        const errorMessage = errorData.error?.message || errorData.error || "Une erreur est survenue"
        alert(errorMessage)
      }
    } catch (error) {
      console.error("Error saving product:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        if (errorData.code === "UPLOAD_SERVICE_UNAVAILABLE") {
          throw new Error("Le service de téléchargement n'est pas disponible. Veuillez utiliser une URL d'image à la place (collez un lien vers une image sur le web).")
        }
        throw new Error(errorData.error || `Erreur ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      if (!data.url) {
        throw new Error("L'URL de l'image n'a pas été retournée")
      }

      form.setValue("imageUrl", data.url)
      setImagePreview(data.url)
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du téléchargement de l'image"
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
      // Clear the input so the same file can be selected again
      e.target.value = ""
    }
  }

  const removeImage = () => {
    form.setValue("imageUrl", "")
    setImagePreview(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nameFr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom français *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Pommes rouges (1 kg)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nameAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom arabe (optionnel)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="تفاح أحمر (1 كغ)" dir="rtl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ""} placeholder="Description du produit..." rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (MAD) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="14.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    placeholder="50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nameFr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (optionnel)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full max-w-xs">
                      <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-md z-10"
                        aria-label="Supprimer l'image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center px-4 py-2 border border-border rounded-lg bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors text-sm font-medium"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Téléchargement..." : imagePreview ? "Changer l'image" : "Télécharger une image"}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading && (
                        <span className="text-sm text-muted-foreground">En cours...</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés: JPG, PNG, GIF. Taille maximum: 5MB
                    </p>
                  </div>

                  {/* URL Input - Alternative method */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Ou collez une URL d'image:</p>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        setImagePreview(e.target.value || null)
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Produit actif</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Les produits inactifs ne seront pas visibles sur le site
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || uploading}>
            {loading ? "Enregistrement..." : product ? "Mettre à jour" : "Créer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}

