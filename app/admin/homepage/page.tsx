"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Loader2, Sparkles, Zap, Shield, CreditCard } from "lucide-react"

interface HomepageContent {
  id?: string
  section: "hero" | "categories" | "products" | "promos" | "trust"
  data: any
  isActive: boolean
}

interface Category {
  id: string
  nameFr: string
  nameAr: string | null
  slug: string
  imageUrl: string | null
}

interface Product {
  id: string
  nameFr: string
  nameAr: string | null
  slug: string
  imageUrl: string | null
  price: number
}

export default function AdminHomepagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [contents, setContents] = useState<Record<string, HomepageContent>>({})
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])

  useEffect(() => {
    loadContent()
    loadCategories()
    loadProducts()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        // Filter to only top-level categories (parentId is null)
        const topLevelCategories = data.filter((cat: any) => !cat.parentId)
        setAvailableCategories(topLevelCategories)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadProducts = async () => {
    try {
      // Fetch all products (up to 1000) to ensure we get all products with images
      const res = await fetch("/api/admin/products?limit=1000")
      if (res.ok) {
        const data = await res.json()
        // API returns array directly, or wrapped in products property
        const products = Array.isArray(data) ? data : (data.products || [])
        // Filter to only active products
        const activeProducts = products.filter((product: any) => product.isActive)
        setAvailableProducts(activeProducts)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadContent = async () => {
    try {
      const res = await fetch("/api/admin/homepage")
      if (res.ok) {
        const data = await res.json()
        const contentMap: Record<string, HomepageContent> = {}
        data.forEach((item: HomepageContent) => {
          contentMap[item.section] = item
        })
        setContents(contentMap)
      }
    } catch (error) {
      console.error("Error loading content:", error)
      setError("Erreur lors du chargement du contenu")
    } finally {
      setLoading(false)
    }
  }

  const getDefaultContent = (section: string): any => {
    switch (section) {
      case "hero":
        return {
          title: "Bienvenue chez Hanouti",
          subtitle: "Vos produits frais livrés à domicile",
          searchPlaceholder: "Rechercher des produits frais... / البحث عن منتجات طازجة...",
          ctaText: "Commencer les achats",
        }
      case "categories":
        return {
          title: "Nos catégories",
          subtitle: "Découvrez notre sélection",
          actionLabel: "Voir tout",
          actionHref: "/categories",
          categoryIds: [], // Array of category IDs to display
        }
      case "products":
        return {
          title: "Produits populaires",
          subtitle: "Découvrez nos produits les plus récents",
          actionLabel: "Voir tous les produits",
          actionHref: "/products",
          productIds: [], // Array of product IDs to display
        }
      case "promos":
        return {
          title: "Promos & Bons plans",
          subtitle: "Profitez de nos offres spéciales",
          promos: [
            {
              badge: "NOUVEAU",
              badgeColor: "primary",
              title: "Livraison gratuite",
              description: "Commandez pour plus de 200 MAD et bénéficiez de la livraison gratuite à Casablanca",
              buttonText: "Commander maintenant",
              buttonLink: "/categories",
              gradient: "from-primary/5 to-primary/10",
            },
            {
              badge: "LIMITÉ",
              badgeColor: "green",
              title: "Produits frais garantis",
              description: "100% produits locaux, récoltés quotidiennement. Fraîcheur garantie ou remboursé",
              buttonText: "Découvrir nos produits",
              buttonLink: "/categories",
              gradient: "from-green-50 to-green-100/50",
            },
          ],
        }
      case "trust":
        return {
          title: "Pourquoi Hanouti ?",
          subtitle: "Votre confiance est notre priorité",
          badges: [
            {
              icon: "zap",
              title: "Livraison rapide",
              description: "Réception de votre commande sous 24h à Casablanca",
            },
            {
              icon: "shield",
              title: "Fraîcheur garantie",
              description: "Produits locaux sélectionnés, récoltés au quotidien",
            },
            {
              icon: "creditCard",
              title: "Paiement à la livraison",
              description: "Payez uniquement lorsque vous recevez votre commande",
            },
          ],
        }
      default:
        return {}
    }
  }

  const updateContent = (section: string, fieldData: any) => {
    setContents((prev) => {
      const current = prev[section] || {
        section: section as any,
        data: getDefaultContent(section),
        isActive: true,
      }
      return {
        ...prev,
        [section]: {
          ...current,
          section: section as any,
          data: { ...current.data, ...fieldData },
          isActive: current.isActive ?? true,
        },
      }
    })
  }

  const saveSection = async (section: string) => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const content = contents[section] || {
        section: section as any,
        data: getDefaultContent(section),
        isActive: true,
      }

      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })

      if (res.ok) {
        setSuccess(`Section "${section}" enregistrée avec succès`)
        // Update local state with saved content
        const saved = await res.json()
        setContents((prev) => ({
          ...prev,
          [section]: saved,
        }))
        
        // Revalidate homepage cache if products or categories were updated
        if (section === "products" || section === "categories") {
          try {
            await fetch("/api/revalidate?path=/&secret=revalidate-2024", {
              method: "GET",
            })
            setSuccess(`Section "${section}" enregistrée et page d'accueil mise à jour !`)
          } catch (revalidateError) {
            console.error("Error revalidating cache:", revalidateError)
            // Don't show error to user, saving was successful
          }
        }
        
        setTimeout(() => setSuccess(null), 5000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      console.error("Error saving content:", error)
      setError("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-sm text-muted-foreground">Chargement du contenu...</p>
      </div>
    )
  }

  // Get content for each section, merge with defaults
  const hero = {
    data: { ...getDefaultContent("hero"), ...(contents["hero"]?.data || {}) },
    isActive: contents["hero"]?.isActive ?? true,
  }
  const categories = {
    data: { ...getDefaultContent("categories"), ...(contents["categories"]?.data || {}) },
    isActive: contents["categories"]?.isActive ?? true,
  }
  const products = {
    data: { ...getDefaultContent("products"), ...(contents["products"]?.data || {}) },
    isActive: contents["products"]?.isActive ?? true,
  }
  const promos = {
    data: { ...getDefaultContent("promos"), ...(contents["promos"]?.data || {}) },
    isActive: contents["promos"]?.isActive ?? true,
  }
  const trust = {
    data: { ...getDefaultContent("trust"), ...(contents["trust"]?.data || {}) },
    isActive: contents["trust"]?.isActive ?? true,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Éditeur de la page d'accueil</h1>
        <p className="text-muted-foreground mt-1">
          Modifiez le contenu de chaque section de votre page d'accueil
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500/50 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700">{success}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="promos">Promos</TabsTrigger>
          <TabsTrigger value="trust">Confiance</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Section Hero</CardTitle>
              <CardDescription>Personnalisez le titre, sous-titre et CTA principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Titre principal</Label>
                <Input
                  id="hero-title"
                  value={hero.data.title || ""}
                  onChange={(e) => updateContent("hero", { title: e.target.value })}
                  placeholder="Bienvenue chez Hanouti"
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Sous-titre</Label>
                <Input
                  id="hero-subtitle"
                  value={hero.data.subtitle || ""}
                  onChange={(e) => updateContent("hero", { subtitle: e.target.value })}
                  placeholder="Vos produits frais livrés à domicile"
                />
              </div>
              <div>
                <Label htmlFor="hero-search">Placeholder de recherche</Label>
                <Input
                  id="hero-search"
                  value={hero.data.searchPlaceholder || ""}
                  onChange={(e) => updateContent("hero", { searchPlaceholder: e.target.value })}
                  placeholder="Rechercher des produits..."
                />
              </div>
              <div>
                <Label htmlFor="hero-cta">Texte du bouton CTA</Label>
                <Input
                  id="hero-cta"
                  value={hero.data.ctaText || ""}
                  onChange={(e) => updateContent("hero", { ctaText: e.target.value })}
                  placeholder="Commencer les achats"
                />
              </div>
              <Button onClick={() => saveSection("hero")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Section */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Section Catégories</CardTitle>
              <CardDescription>Personnalisez le titre et l'action de la section catégories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cats-title">Titre</Label>
                <Input
                  id="cats-title"
                  value={categories.data.title || ""}
                  onChange={(e) => updateContent("categories", { title: e.target.value })}
                  placeholder="Nos catégories"
                />
              </div>
              <div>
                <Label htmlFor="cats-subtitle">Sous-titre</Label>
                <Input
                  id="cats-subtitle"
                  value={categories.data.subtitle || ""}
                  onChange={(e) => updateContent("categories", { subtitle: e.target.value })}
                  placeholder="Découvrez notre sélection"
                />
              </div>
              <div>
                <Label htmlFor="cats-action">Texte du lien "Voir tout"</Label>
                <Input
                  id="cats-action"
                  value={categories.data.actionLabel || ""}
                  onChange={(e) => updateContent("categories", { actionLabel: e.target.value })}
                  placeholder="Voir tout"
                />
              </div>
              <div>
                <Label className="mb-3 block">Catégories à afficher</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                  {availableCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chargement des catégories...</p>
                  ) : (
                    availableCategories.map((category) => {
                      const selectedIds = categories.data.categoryIds || []
                      const isSelected = selectedIds.includes(category.id)
                      return (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentIds = categories.data.categoryIds || []
                              const newIds = checked
                                ? [...currentIds, category.id]
                                : currentIds.filter((id: string) => id !== category.id)
                              updateContent("categories", { categoryIds: newIds })
                            }}
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {category.nameFr}
                            {category.nameAr && (
                              <span className="text-muted-foreground ml-2">({category.nameAr})</span>
                            )}
                          </label>
                        </div>
                      )
                    })
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sélectionnez les catégories à afficher sur la page d&apos;accueil (maximum 8 recommandé)
                </p>
              </div>
              <Button onClick={() => saveSection("categories")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Section */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Section Produits populaires</CardTitle>
              <CardDescription>Personnalisez le titre, l'action et sélectionnez les produits à afficher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="products-title">Titre</Label>
                <Input
                  id="products-title"
                  value={products.data.title || ""}
                  onChange={(e) => updateContent("products", { title: e.target.value })}
                  placeholder="Produits populaires"
                />
              </div>
              <div>
                <Label htmlFor="products-subtitle">Sous-titre</Label>
                <Input
                  id="products-subtitle"
                  value={products.data.subtitle || ""}
                  onChange={(e) => updateContent("products", { subtitle: e.target.value })}
                  placeholder="Découvrez nos produits les plus récents"
                />
              </div>
              <div>
                <Label htmlFor="products-action">Texte du lien action</Label>
                <Input
                  id="products-action"
                  value={products.data.actionLabel || ""}
                  onChange={(e) => updateContent("products", { actionLabel: e.target.value })}
                  placeholder="Voir tous les produits"
                />
              </div>
              <div>
                <Label className="mb-3 block">Produits à afficher ({availableProducts.length} produits disponibles)</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                  {availableProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chargement des produits...</p>
                  ) : (
                    availableProducts.map((product) => {
                      const selectedIds = products.data.productIds || []
                      const isSelected = selectedIds.includes(product.id)
                      return (
                        <div key={product.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentIds = products.data.productIds || []
                              const newIds = checked
                                ? [...currentIds, product.id]
                                : currentIds.filter((id: string) => id !== product.id)
                              updateContent("products", { productIds: newIds })
                            }}
                          />
                          <label
                            htmlFor={`product-${product.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                          >
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.nameFr}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <div>{product.nameFr}</div>
                              {product.nameAr && (
                                <span className="text-xs text-muted-foreground">({product.nameAr})</span>
                              )}
                              <span className="text-xs text-muted-foreground ml-2">
                                - {product.price} MAD
                              </span>
                            </div>
                          </label>
                        </div>
                      )
                    })
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sélectionnez les produits à afficher sur la page d&apos;accueil (maximum 4 recommandé)
                </p>
              </div>
              <Button onClick={() => saveSection("products")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promos Section */}
        <TabsContent value="promos">
          <Card>
            <CardHeader>
              <CardTitle>Section Promos & Bons plans</CardTitle>
              <CardDescription>Personnalisez les cartes promotionnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="promos-title">Titre de la section</Label>
                  <Input
                    id="promos-title"
                    value={promos.data.title || ""}
                    onChange={(e) => updateContent("promos", { title: e.target.value })}
                    placeholder="Promos & Bons plans"
                  />
                </div>
                <div>
                  <Label htmlFor="promos-subtitle">Sous-titre</Label>
                  <Input
                    id="promos-subtitle"
                    value={promos.data.subtitle || ""}
                    onChange={(e) => updateContent("promos", { subtitle: e.target.value })}
                    placeholder="Profitez de nos offres spéciales"
                  />
                </div>
              </div>

              {/* Promo 1 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Promo 1</h3>
                <div>
                  <Label>Badge</Label>
                  <Input
                    value={promos.data.promos?.[0]?.badge || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[0]) newPromos[0] = { ...defaultPromos[0] }
                      newPromos[0] = { ...newPromos[0], badge: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="NOUVEAU"
                  />
                </div>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={promos.data.promos?.[0]?.title || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[0]) newPromos[0] = { ...defaultPromos[0] }
                      newPromos[0] = { ...newPromos[0], title: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="Livraison gratuite"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={promos.data.promos?.[0]?.description || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[0]) newPromos[0] = { ...defaultPromos[0] }
                      newPromos[0] = { ...newPromos[0], description: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="Description de la promo..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Texte du bouton</Label>
                  <Input
                    value={promos.data.promos?.[0]?.buttonText || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[0]) newPromos[0] = { ...defaultPromos[0] }
                      newPromos[0] = { ...newPromos[0], buttonText: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="Commander maintenant"
                  />
                </div>
              </div>

              {/* Promo 2 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Promo 2</h3>
                <div>
                  <Label>Badge</Label>
                  <Input
                    value={promos.data.promos?.[1]?.badge || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[1]) newPromos[1] = { ...(defaultPromos[1] || {}) }
                      newPromos[1] = { ...newPromos[1], badge: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="LIMITÉ"
                  />
                </div>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={promos.data.promos?.[1]?.title || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[1]) newPromos[1] = { ...(defaultPromos[1] || {}) }
                      newPromos[1] = { ...newPromos[1], title: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="Produits frais garantis"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={promos.data.promos?.[1]?.description || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[1]) newPromos[1] = { ...(defaultPromos[1] || {}) }
                      newPromos[1] = { ...newPromos[1], description: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="Description de la promo..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Texte du bouton</Label>
                  <Input
                    value={promos.data.promos?.[1]?.buttonText || ""}
                    onChange={(e) => {
                      const defaultPromos = getDefaultContent("promos").promos || []
                      const currentPromos = promos.data.promos || defaultPromos
                      const newPromos = [...currentPromos]
                      if (!newPromos[1]) newPromos[1] = { ...(defaultPromos[1] || {}) }
                      newPromos[1] = { ...newPromos[1], buttonText: e.target.value }
                      updateContent("promos", { promos: newPromos })
                    }}
                    placeholder="Découvrir nos produits"
                  />
                </div>
              </div>

              <Button onClick={() => saveSection("promos")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Section */}
        <TabsContent value="trust">
          <Card>
            <CardHeader>
              <CardTitle>Section Pourquoi Hanouti ?</CardTitle>
              <CardDescription>Personnalisez les badges de confiance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trust-title">Titre de la section</Label>
                  <Input
                    id="trust-title"
                    value={trust.data.title || ""}
                    onChange={(e) => updateContent("trust", { title: e.target.value })}
                    placeholder="Pourquoi Hanouti ?"
                  />
                </div>
                <div>
                  <Label htmlFor="trust-subtitle">Sous-titre</Label>
                  <Input
                    id="trust-subtitle"
                    value={trust.data.subtitle || ""}
                    onChange={(e) => updateContent("trust", { subtitle: e.target.value })}
                    placeholder="Votre confiance est notre priorité"
                  />
                </div>
              </div>

              {/* Badge 1 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Badge 1</h3>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={trust.data.badges?.[0]?.title || ""}
                    onChange={(e) => {
                      const defaultBadges = getDefaultContent("trust").badges || []
                      const currentBadges = trust.data.badges || defaultBadges
                      const newBadges = [...currentBadges]
                      if (!newBadges[0]) newBadges[0] = { ...defaultBadges[0] }
                      newBadges[0] = { ...newBadges[0], title: e.target.value }
                      updateContent("trust", { badges: newBadges })
                    }}
                    placeholder="Livraison rapide"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={trust.data.badges?.[0]?.description || ""}
                    onChange={(e) => {
                      const defaultBadges = getDefaultContent("trust").badges || []
                      const currentBadges = trust.data.badges || defaultBadges
                      const newBadges = [...currentBadges]
                      if (!newBadges[0]) newBadges[0] = { ...defaultBadges[0] }
                      newBadges[0] = { ...newBadges[0], description: e.target.value }
                      updateContent("trust", { badges: newBadges })
                    }}
                    placeholder="Description..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Badge 2 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Badge 2</h3>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={trust.data.badges?.[1]?.title || ""}
                    onChange={(e) => {
                      const defaultBadges = getDefaultContent("trust").badges || []
                      const currentBadges = trust.data.badges || defaultBadges
                      const newBadges = [...currentBadges]
                      if (!newBadges[1]) newBadges[1] = { ...(defaultBadges[1] || {}) }
                      newBadges[1] = { ...newBadges[1], title: e.target.value }
                      updateContent("trust", { badges: newBadges })
                    }}
                    placeholder="Fraîcheur garantie"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={trust.data.badges?.[1]?.description || ""}
                    onChange={(e) => {
                      const defaultBadges = getDefaultContent("trust").badges || []
                      const currentBadges = trust.data.badges || defaultBadges
                      const newBadges = [...currentBadges]
                      if (!newBadges[1]) newBadges[1] = { ...(defaultBadges[1] || {}) }
                      newBadges[1] = { ...newBadges[1], description: e.target.value }
                      updateContent("trust", { badges: newBadges })
                    }}
                    placeholder="Description..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Badge 3 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Badge 3</h3>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={trust.data.badges?.[2]?.title || ""}
                    onChange={(e) => {
                      const defaultBadges = getDefaultContent("trust").badges || []
                      const currentBadges = trust.data.badges || defaultBadges
                      const newBadges = [...currentBadges]
                      if (!newBadges[2]) newBadges[2] = { ...(defaultBadges[2] || {}) }
                      newBadges[2] = { ...newBadges[2], title: e.target.value }
                      updateContent("trust", { badges: newBadges })
                    }}
                    placeholder="Paiement à la livraison"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={trust.data.badges?.[2]?.description || ""}
                    onChange={(e) => {
                      const defaultBadges = getDefaultContent("trust").badges || []
                      const currentBadges = trust.data.badges || defaultBadges
                      const newBadges = [...currentBadges]
                      if (!newBadges[2]) newBadges[2] = { ...(defaultBadges[2] || {}) }
                      newBadges[2] = { ...newBadges[2], description: e.target.value }
                      updateContent("trust", { badges: newBadges })
                    }}
                    placeholder="Description..."
                    rows={2}
                  />
                </div>
              </div>

              <Button onClick={() => saveSection("trust")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

