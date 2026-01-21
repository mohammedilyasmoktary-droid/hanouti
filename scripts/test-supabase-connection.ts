/**
 * Test Supabase Connection
 * 
 * This script tests if we can connect to Supabase and see what data exists
 */

import { PrismaClient } from "@prisma/client"

// Use OLD_DATABASE_URL if set, otherwise use DATABASE_URL
const supabaseUrl = process.env.OLD_DATABASE_URL || process.env.DATABASE_URL || ""

const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseUrl,
    },
  },
})

console.log("🔗 Using connection string:", supabaseUrl.replace(/:[^:@]+@/, ":****@"))

async function testConnection() {
  console.log("🔍 Testing Supabase connection...\n")
  
  try {
    // Test connection
    await oldPrisma.$connect()
    console.log("✅ Connected to Supabase successfully!\n")

    // Check if tables exist
    console.log("📊 Checking tables...")
    
    // Try to count items in each table
    const categoryCount = await oldPrisma.category.count()
    const productCount = await oldPrisma.product.count()
    const userCount = await oldPrisma.user.count()
    const orderCount = await oldPrisma.order.count()
    const messageCount = await oldPrisma.contactMessage.count()
    const homepageCount = await oldPrisma.homepageContent.count()

    console.log(`   Categories: ${categoryCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Orders: ${orderCount}`)
    console.log(`   Contact Messages: ${messageCount}`)
    console.log(`   Homepage Content: ${homepageCount}`)

    // If we have categories, show a few
    if (categoryCount > 0) {
      console.log("\n📦 Sample Categories:")
      const categories = await oldPrisma.category.findMany({
        take: 5,
        select: {
          id: true,
          nameFr: true,
          slug: true,
          parentId: true,
        },
      })
      categories.forEach((cat) => {
        console.log(`   - ${cat.nameFr} (${cat.slug})`)
      })
    }

    // If we have products, show a few
    if (productCount > 0) {
      console.log("\n🛒 Sample Products:")
      const products = await oldPrisma.product.findMany({
        take: 5,
        select: {
          id: true,
          nameFr: true,
          slug: true,
          categoryId: true,
        },
      })
      products.forEach((prod) => {
        console.log(`   - ${prod.nameFr} (${prod.slug})`)
      })
    }

    console.log("\n✅ Connection test completed!")
    
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message)
    console.error("\nPossible issues:")
    console.error("   - Connection string is incorrect")
    console.error("   - Password needs URL encoding")
    console.error("   - Database is not accessible")
    console.error("   - Network issue")
  } finally {
    await oldPrisma.$disconnect()
  }
}

testConnection()
  .catch((error) => {
    console.error("Test error:", error)
    process.exit(1)
  })

