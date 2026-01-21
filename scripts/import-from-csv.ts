/**
 * Import Data from CSV to Neon
 * 
 * This script imports data from CSV files exported from Supabase to Neon
 * 
 * Usage:
 * 1. Export data from Supabase as CSV
 * 2. Place CSV files in: scripts/data/
 * 3. Run: npx tsx scripts/import-from-csv.ts
 * 
 * CSV files needed:
 * - categories.csv
 * - products.csv
 * - users.csv (optional)
 * - orders.csv (optional)
 * - orderItems.csv (optional)
 * - contactMessages.csv (optional)
 * - homepageContent.csv (optional)
 */

import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

interface CSVRow {
  [key: string]: string
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split("\n").filter((line) => line.trim() !== "")
  
  if (lines.length === 0) {
    return []
  }
  
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    const row: CSVRow = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    rows.push(row)
  }
  
  return rows
}

async function importCategories() {
  const filePath = path.join(process.cwd(), "scripts", "data", "categories.csv")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No categories.csv found, skipping...")
    return
  }
  
  console.log("📦 Importing Categories...")
  const rows = parseCSV(filePath)
  
  // Separate parent and child categories
  const parentCategories = rows.filter((row) => !row.parentId || row.parentId === "")
  const childCategories = rows.filter((row) => row.parentId && row.parentId !== "")
  
  console.log(`   Found ${parentCategories.length} parent categories`)
  console.log(`   Found ${childCategories.length} child categories`)
  
  // Import parent categories first
  for (const row of parentCategories) {
    try {
      await prisma.category.create({
        data: {
          id: row.id || undefined,
          nameFr: row.nameFr || row.namefr || "",
          nameAr: row.nameAr || row.namear || null,
          slug: row.slug || "",
          imageUrl: row.imageUrl || row.imageurl || null,
          parentId: null,
          sortOrder: parseInt(row.sortOrder || row.sortorder || "0") || 0,
          isActive: row.isActive === "true" || row.isactive === "true" || row.isActive === "1" || true,
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        },
      })
      console.log(`   ✅ Imported category: ${row.nameFr || row.namefr}`)
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`   ⚠️  Category already exists: ${row.nameFr || row.namefr}`)
      } else {
        console.error(`   ❌ Error importing category ${row.nameFr || row.namefr}:`, error.message)
      }
    }
  }
  
  // Import child categories
  for (const row of childCategories) {
    try {
      await prisma.category.create({
        data: {
          id: row.id || undefined,
          nameFr: row.nameFr || row.namefr || "",
          nameAr: row.nameAr || row.namear || null,
          slug: row.slug || "",
          imageUrl: row.imageUrl || row.imageurl || null,
          parentId: row.parentId || row.parentid || null,
          sortOrder: parseInt(row.sortOrder || row.sortorder || "0") || 0,
          isActive: row.isActive === "true" || row.isactive === "true" || row.isActive === "1" || true,
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        },
      })
      console.log(`   ✅ Imported child category: ${row.nameFr || row.namefr}`)
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`   ⚠️  Category already exists: ${row.nameFr || row.namefr}`)
      } else {
        console.error(`   ❌ Error importing category ${row.nameFr || row.namefr}:`, error.message)
      }
    }
  }
}

async function importProducts() {
  const filePath = path.join(process.cwd(), "scripts", "data", "products.csv")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No products.csv found, skipping...")
    return
  }
  
  console.log("\n🛒 Importing Products...")
  const rows = parseCSV(filePath)
  
  console.log(`   Found ${rows.length} products`)
  
  for (const row of rows) {
    try {
      await prisma.product.create({
        data: {
          id: row.id || undefined,
          nameFr: row.nameFr || row.namefr || "",
          nameAr: row.nameAr || row.namear || null,
          slug: row.slug || "",
          description: row.description || null,
          price: row.price ? parseFloat(row.price) : 0,
          imageUrl: row.imageUrl || row.imageurl || null,
          categoryId: row.categoryId || row.categoryid || "",
          isActive: row.isActive === "true" || row.isactive === "true" || row.isActive === "1" || true,
          stock: parseInt(row.stock || "0") || 0,
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        },
      })
      console.log(`   ✅ Imported product: ${row.nameFr || row.namefr}`)
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`   ⚠️  Product already exists: ${row.nameFr || row.namefr}`)
      } else if (error.code === "P2003") {
        console.log(`   ⚠️  Category not found for product ${row.nameFr || row.namefr}, skipping...`)
      } else {
        console.error(`   ❌ Error importing product ${row.nameFr || row.namefr}:`, error.message)
      }
    }
  }
}

async function importUsers() {
  const filePath = path.join(process.cwd(), "scripts", "data", "users.csv")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No users.csv found, skipping...")
    return
  }
  
  console.log("\n👤 Importing Users...")
  const rows = parseCSV(filePath)
  
  console.log(`   Found ${rows.length} users`)
  
  for (const row of rows) {
    try {
      await prisma.user.create({
        data: {
          id: row.id || undefined,
          email: row.email || "",
          name: row.name || null,
          password: row.password || "",
          role: (row.role || "CUSTOMER") as "ADMIN" | "CUSTOMER",
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        },
      })
      console.log(`   ✅ Imported user: ${row.email}`)
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`   ⚠️  User already exists: ${row.email}`)
      } else {
        console.error(`   ❌ Error importing user ${row.email}:`, error.message)
      }
    }
  }
}

async function main() {
  console.log("🚀 Starting CSV import to Neon...\n")
  
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "scripts", "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log("📁 Created scripts/data directory")
      console.log("   Place your CSV files there and run this script again\n")
      return
    }
    
    // Import in order (categories first, then products)
    await importCategories()
    await importProducts()
    await importUsers()
    
    console.log("\n✅ Import completed successfully!")
    
  } catch (error) {
    console.error("❌ Import failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error("Import error:", error)
    process.exit(1)
  })

