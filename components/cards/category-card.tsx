import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  category: {
    id: string
    nameFr: string
    nameAr?: string | null
    slug: string
    imageUrl?: string | null
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
        "group block h-full",
        className
      )}
    >
      <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col focus-within:ring-2 focus-within:ring-primary/10">
        {/* Image Container - Fixed Aspect Ratio */}
        <div className="aspect-[4/3] bg-zinc-50 overflow-hidden relative">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.nameFr}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 pointer-events-none">
              <Package className="h-10 w-10 text-zinc-400" />
            </div>
          )}
        </div>

        {/* Content - Pinned to bottom */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm text-zinc-900 mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {category.nameFr}
          </h3>
          {category.nameAr && (
            <p className="text-xs text-zinc-600 mb-3 line-clamp-1">
              {category.nameAr}
            </p>
          )}
          
          {/* Subcategories count badge */}
          {showSubcategories && subcategoryCount !== undefined && subcategoryCount > 0 && (
            <div className="mt-auto pt-3 border-t border-zinc-200">
              <span className="text-xs text-zinc-500">
                {subcategoryCount} sous-catégorie{subcategoryCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}


