/**
 * Check what data was successfully imported to Neon
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkImportedData() {
  console.log("🔍 Checking imported data in Neon...\n")
  
  try {
    // Count categories
    const categoryCount = await prisma.category.count()
    const parentCategoryCount = await prisma.category.count({
      where: { parentId: null }
    })
    const activeCategoryCount = await prisma.category.count({
      where: { isActive: true, parentId: null }
    })
    
    console.log("📦 Categories:")
    console.log(`   Total: ${categoryCount}`)
    console.log(`   Parent categories: ${parentCategoryCount}`)
    console.log(`   Active parent categories: ${activeCategoryCount}`)
    
    // List all parent categories
    const parentCategories = await prisma.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        nameFr: true,
        slug: true,
        isActive: true,
        _count: {
          select: { children: true }
        }
      },
      orderBy: { sortOrder: "asc" }
    })
    
    console.log("\n📋 Parent Categories:")
    parentCategories.forEach((cat) => {
      console.log(`   ${cat.isActive ? '✅' : '❌'} ${cat.nameFr} (${cat.slug}) - ${cat._count.children} children`)
    })
    
    // Count products
    const productCount = await prisma.product.count()
    const activeProductCount = await prisma.product.count({
      where: { isActive: true }
    })
    
    console.log("\n🛒 Products:")
    console.log(`   Total: ${productCount}`)
    console.log(`   Active: ${activeProductCount}`)
    
    // Products by category
    const productsByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    })
    
    console.log("\n📊 Products by Category:")
    for (const group of productsByCategory) {
      const category = await prisma.category.findUnique({
        where: { id: group.categoryId },
        select: { nameFr: true }
      })
      console.log(`   ${category?.nameFr || 'Unknown'}: ${group._count.id} products`)
    }
    
    // Check for categories with no products
    const categoriesWithoutProducts = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
        products: {
          none: {}
        }
      },
      select: {
        nameFr: true,
        slug: true
      }
    })
    
    if (categoriesWithoutProducts.length > 0) {
      console.log("\n⚠️  Categories without products:")
      categoriesWithoutProducts.forEach((cat) => {
        console.log(`   - ${cat.nameFr}`)
      })
    }
    
  } catch (error) {
    console.error("❌ Error checking data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkImportedData()

