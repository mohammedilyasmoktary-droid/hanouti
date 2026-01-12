"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Upload, X, Image as ImageIcon } from "lucide-react"

const categorySchema = z.object({
  nameFr: z.string().min(1, "Le nom français est requis"),
  nameAr: z.string().optional(),
  slug: z.string().min(1, "Le slug est requis"),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || val.startsWith("/uploads/") || val.startsWith("http://") || val.startsWith("https://"),
      { message: "URL invalide" }
    )
    .optional()
    .nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: {
    id: string
    nameFr: string
    nameAr: string | null
    slug: string
    imageUrl: string | null
    parentId: string | null
    sortOrder: number
    isActive: boolean
  }
  parentCategories: { id: string; nameFr: string }[]
}

export function CategoryForm({ category, parentCategories }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameFr: category?.nameFr || "",
      nameAr: category?.nameAr || "",
      slug: category?.slug || "",
      imageUrl: category?.imageUrl || "",
      parentId: category?.parentId || null,
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
    },
  })

  const currentImageUrl = form.watch("imageUrl")
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null)
  
  // Update preview when form value changes
  useEffect(() => {
    setImagePreview(currentImageUrl || null)
  }, [currentImageUrl])

  const onSubmit = async (data: CategoryFormValues) => {
    setLoading(true)
    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories"
      const method = category ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrl: data.imageUrl || null, // Ensure null instead of empty string
        }),
      })

      if (res.ok) {
        router.push("/admin/categories")
        router.refresh()
      } else {
        const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        const errorMessage = errorData.error?.message || errorData.error || "Une erreur est survenue"
        alert(errorMessage)
      }
    } catch (error) {
      console.error("Error saving category:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from nameFr
  const nameFr = form.watch("nameFr")
  const currentSlug = form.watch("slug")

  const generateSlug = () => {
    if (!nameFr) return
    const slug = nameFr
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    form.setValue("slug", slug)
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
        if (errorData.code === "CLOUDINARY_NOT_CONFIGURED") {
          throw new Error("Cloudinary n'est pas configuré. Veuillez configurer les variables d'environnement CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.")
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
                <Input {...field} placeholder="Fruits & Légumes" />
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
                <Input {...field} value={field.value || ""} placeholder="فواكه وخضروات" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...field} placeholder="fruits-legumes" />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Générer
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optionnel)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full max-w-xs">
                      <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide broken images
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 active:bg-destructive/95 transition-colors shadow-md"
                        aria-label="Supprimer l'image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="inline-block w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={uploading}
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Téléchargement..." : imagePreview ? "Changer l'image" : "Télécharger une image"}
                      </Button>
                    </label>
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
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie parente (optionnel)</FormLabel>
              <Select
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune (catégorie racine)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                  {parentCategories.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.nameFr}
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
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordre d&apos;affichage</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <FormLabel className="!mt-0">Catégorie active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : category ? "Modifier" : "Créer"}
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

