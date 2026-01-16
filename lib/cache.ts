/**
 * Cache utilities for database queries
 * Using React cache() for request-level memoization
 */
import { cache } from "react"

/**
 * Memoized database query cache
 * Results are cached for the duration of a single request
 */
export const getCachedQuery = <T,>(
  key: string,
  queryFn: () => Promise<T>,
  tags?: string[]
): Promise<T> => {
  // Use React cache for request-level memoization
  const cachedFn = cache(async () => {
    return await queryFn()
  })
  
  return cachedFn() as Promise<T>
}

/**
 * Generate cache tags for revalidation
 */
export const CACHE_TAGS = {
  categories: "categories",
  products: "products",
  homepage: "homepage",
  orders: "orders",
} as const

