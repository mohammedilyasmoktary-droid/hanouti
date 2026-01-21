/**
 * Recover Images from CSV
 * 
 * This script extracts base64 images from CSV files, uploads them to
 * freeimage.host, and updates the database with the image URLs.
 * 
 * Usage:
 * npx tsx scripts/recover-images.ts
 */

import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

interface CSVRow {
  [key: string]: string
}

// Parse CSV with base64 image support
function parseCSVWithImages(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, "utf-8")
  
  if (content.length === 0) {
    return []
  }
  
  const lines: string[] = []
  let currentLine = ""
  let inQuotes = false
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"'
        i++
      } else {
        inQuotes = !inQuotes
        currentLine += char
      }
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine)
      currentLine = ""
    } else {
      currentLine += char
    }
  }
  
  if (currentLine.trim() !== "") {
    lines.push(currentLine)
  }
  
  if (lines.length === 0) {
    return []
  }
  
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values: string[] = []
    let currentValue = ""
    let inQuotes = false
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      const nextChar = line[j + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"'
          j++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim())
        currentValue = ""
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())
    
    const row: CSVRow = {}
    headers.forEach((header, index) => {
      let value = values[index] || ""
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"')
      }
      row[header] = value
    })
    
    if (row.nameFr || row.namefr) {
      rows.push(row)
    }
  }
  
  return rows
}

// Upload base64 image to freeimage.host
async function uploadBase64Image(base64Data: string): Promise<string | null> {
  try {
    // Extract base64 data (remove data:image/png;base64, prefix if present)
    const base64Match = base64Data.match(/base64,(.+)/)
    const base64 = base64Match ? base64Match[1] : base64Data
    
    const response = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: "6d207e02198a847aa98d0a2a", // Public demo key from upload route
        source: base64,
        format: "json",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.image && data.image.url) {
        return data.image.url
      }
    }
    
    console.error(`   ⚠️  Failed to upload image: ${response.status}`)
    return null
  } catch (error) {
    console.error(`   ❌ Error uploading image:`, error)
    return null
  }
}

async function recoverCategoryImages() {
  const filePath = path.join(process.cwd(), "scripts", "data", "categories.csv")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No categories.csv found, skipping...")
    return
  }
  
  console.log("🖼️  Recovering category images...")
  const rows = parseCSVWithImages(filePath)
  
  let processed = 0
  let uploaded = 0
  let skipped = 0
  let failed = 0
  
  for (const row of rows) {
    const imageUrl = row.imageUrl || row.imageurl || ""
    
    // Skip if no image or already a URL (not base64)
    if (!imageUrl || !imageUrl.startsWith("data:image")) {
      skipped++
      continue
    }
    
    processed++
    
    // Find the category by slug or id
    const categorySlug = row.slug || ""
    const categoryId = row.id || ""
    
    if (!categorySlug && !categoryId) {
      console.log(`   ⚠️  Skipping category without slug/id: ${row.nameFr || row.namefr}`)
      skipped++
      continue
    }
    
    try {
      // Find category in database
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: categorySlug },
            { id: categoryId }
          ]
        }
      })
      
      if (!category) {
        console.log(`   ⚠️  Category not found in database: ${categorySlug || categoryId}`)
        skipped++
        continue
      }
      
      // Skip if category already has an image URL (not base64)
      if (category.imageUrl && !category.imageUrl.startsWith("data:image")) {
        console.log(`   ℹ️  Category already has image URL: ${category.nameFr}`)
        skipped++
        continue
      }
      
      console.log(`   📤 Uploading image for: ${category.nameFr}...`)
      
      // Upload image
      const uploadedUrl = await uploadBase64Image(imageUrl)
      
      if (uploadedUrl) {
        // Update database
        await prisma.category.update({
          where: { id: category.id },
          data: { imageUrl: uploadedUrl }
        })
        
        console.log(`   ✅ Uploaded and updated: ${category.nameFr}`)
        uploaded++
        
        // Rate limiting - wait 1 second between uploads
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        failed++
      }
    } catch (error: any) {
      console.error(`   ❌ Error processing ${row.nameFr || row.namefr}:`, error.message)
      failed++
    }
  }
  
  console.log(`\n📊 Category Images Summary:`)
  console.log(`   Processed: ${processed}`)
  console.log(`   Uploaded: ${uploaded}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Failed: ${failed}`)
}

async function recoverProductImages() {
  const filePath = path.join(process.cwd(), "scripts", "data", "products.csv")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No products.csv found, skipping...")
    return
  }
  
  console.log("\n🖼️  Recovering product images...")
  const rows = parseCSVWithImages(filePath)
  
  let processed = 0
  let uploaded = 0
  let skipped = 0
  let failed = 0
  
  for (const row of rows) {
    const imageUrl = row.imageUrl || row.imageurl || ""
    
    // Skip if no image or already a URL (not base64)
    if (!imageUrl || !imageUrl.startsWith("data:image")) {
      skipped++
      continue
    }
    
    processed++
    
    // Find the product by slug or id
    const productSlug = row.slug || ""
    const productId = row.id || ""
    
    if (!productSlug && !productId) {
      skipped++
      continue
    }
    
    try {
      // Find product in database
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { slug: productSlug },
            { id: productId }
          ]
        }
      })
      
      if (!product) {
        skipped++
        continue
      }
      
      // Skip if product already has an image URL (not base64)
      if (product.imageUrl && !product.imageUrl.startsWith("data:image")) {
        skipped++
        continue
      }
      
      if (processed % 10 === 0) {
        console.log(`   📤 Uploading image ${processed}/${rows.length}...`)
      }
      
      // Upload image
      const uploadedUrl = await uploadBase64Image(imageUrl)
      
      if (uploadedUrl) {
        // Update database
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: uploadedUrl }
        })
        
        uploaded++
        
        // Rate limiting - wait 1 second between uploads
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        failed++
      }
    } catch (error: any) {
      failed++
    }
  }
  
  console.log(`\n📊 Product Images Summary:`)
  console.log(`   Processed: ${processed}`)
  console.log(`   Uploaded: ${uploaded}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Failed: ${failed}`)
}

async function main() {
  console.log("🚀 Starting image recovery...\n")
  
  try {
    await recoverCategoryImages()
    await recoverProductImages()
    
    console.log("\n✅ Image recovery completed!")
    
  } catch (error) {
    console.error("❌ Recovery failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error("Recovery error:", error)
    process.exit(1)
  })

