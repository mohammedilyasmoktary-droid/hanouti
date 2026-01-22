import Link from "next/link"
import Image from "next/image"
import { Package, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  category: {
    id: string
    nameFr: string
    nameAr?: string | null
    slug: string
    imageUrl?: string | null
    isPopular?: boolean
    isNew?: boolean
  }
  showSubcategories?: boolean
  subcategoryCount?: number
  className?: string
}

export function CategoryCard({ 
  category, 
  showSubcategories = false, 
  subcategoryCount,
  className 
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl",
        className
      )}
      aria-label={`Voir la catégorie ${category.nameFr}`}
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
        {/* Image Container - Fixed Aspect Ratio */}
        <div className="aspect-[4/3] bg-muted overflow-hidden relative">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.nameFr}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out pointer-events-none"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted pointer-events-none">
              <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          
          {/* Optional badges - only show if data exists */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {category.isPopular && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md backdrop-blur-sm">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                Populaire
              </span>
            )}
            {category.isNew && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-md" style={{ backgroundColor: 'var(--appetite)', color: 'var(--appetite-foreground)' }}>
                Nouveau
              </span>
            )}
          </div>
        </div>

        {/* Content - Pinned to bottom */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
            {category.nameFr}
          </h3>
          {category.nameAr && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1 leading-relaxed" dir="rtl" lang="ar">
              {category.nameAr}
            </p>
          )}
          
          {/* Subcategories count badge */}
          {showSubcategories && subcategoryCount !== undefined && subcategoryCount > 0 && (
            <div className="mt-auto pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {subcategoryCount} sous-catégorie{subcategoryCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}


