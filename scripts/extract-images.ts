/**
 * Extract Images from CSV
 * 
 * This script extracts base64 images from CSV files and saves them
 * as image files so you can upload them manually.
 * 
 * Usage:
 * npx tsx scripts/extract-images.ts
 */

import * as fs from "fs"
import * as path from "path"

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

async function extractCategoryImages() {
  const filePath = path.join(process.cwd(), "scripts", "data", "categories.csv")
  const outputDir = path.join(process.cwd(), "scripts", "data", "images", "categories")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No categories.csv found, skipping...")
    return
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  console.log("🖼️  Extracting category images...")
  const rows = parseCSVWithImages(filePath)
  
  let extracted = 0
  let skipped = 0
  
  for (const row of rows) {
    const imageUrl = row.imageUrl || row.imageurl || ""
    
    // Skip if no image or already a URL (not base64)
    if (!imageUrl || !imageUrl.startsWith("data:image")) {
      skipped++
      continue
    }
    
    try {
      // Extract base64 data and image type
      const base64Match = imageUrl.match(/data:image\/(\w+);base64,(.+)/)
      if (!base64Match) {
        skipped++
        continue
      }
      
      const imageType = base64Match[1] // png, jpeg, etc.
      const base64Data = base64Match[2]
      
      // Get category name for filename
      const categoryName = (row.nameFr || row.namefr || "unknown").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
      const slug = row.slug || categoryName
      const filename = `${slug}.${imageType}`
      const filePath = path.join(outputDir, filename)
      
      // Convert base64 to buffer and save
      const buffer = Buffer.from(base64Data, "base64")
      fs.writeFileSync(filePath, buffer)
      
      console.log(`   ✅ Extracted: ${row.nameFr || row.namefr} -> ${filename}`)
      extracted++
    } catch (error: any) {
      console.error(`   ❌ Error extracting image for ${row.nameFr || row.namefr}:`, error.message)
      skipped++
    }
  }
  
  console.log(`\n📊 Category Images Summary:`)
  console.log(`   Extracted: ${extracted}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Location: ${outputDir}`)
}

async function extractProductImages() {
  const filePath = path.join(process.cwd(), "scripts", "data", "products.csv")
  const outputDir = path.join(process.cwd(), "scripts", "data", "images", "products")
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  No products.csv found, skipping...")
    return
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  console.log("\n🖼️  Extracting product images...")
  const rows = parseCSVWithImages(filePath)
  
  let extracted = 0
  let skipped = 0
  
  for (const row of rows) {
    const imageUrl = row.imageUrl || row.imageurl || ""
    
    // Skip if no image or already a URL (not base64)
    if (!imageUrl || !imageUrl.startsWith("data:image")) {
      skipped++
      continue
    }
    
    try {
      // Extract base64 data and image type
      const base64Match = imageUrl.match(/data:image\/(\w+);base64,(.+)/)
      if (!base64Match) {
        skipped++
        continue
      }
      
      const imageType = base64Match[1]
      const base64Data = base64Match[2]
      
      // Get product name for filename
      const productName = (row.nameFr || row.namefr || "unknown").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
      const slug = row.slug || productName
      const filename = `${slug}.${imageType}`
      const filePath = path.join(outputDir, filename)
      
      // Convert base64 to buffer and save
      const buffer = Buffer.from(base64Data, "base64")
      fs.writeFileSync(filePath, buffer)
      
      extracted++
      if (extracted % 10 === 0) {
        console.log(`   ✅ Extracted ${extracted} images...`)
      }
    } catch (error: any) {
      skipped++
    }
  }
  
  console.log(`\n📊 Product Images Summary:`)
  console.log(`   Extracted: ${extracted}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Location: ${outputDir}`)
}

async function main() {
  console.log("🚀 Starting image extraction...\n")
  
  try {
    await extractCategoryImages()
    await extractProductImages()
    
    console.log("\n✅ Image extraction completed!")
    console.log("\n📁 Images saved to:")
    console.log(`   - Categories: scripts/data/images/categories/`)
    console.log(`   - Products: scripts/data/images/products/`)
    console.log("\n💡 Next steps:")
    console.log("   1. Upload images through admin panel: https://hanouti.vercel.app/admin")
    console.log("   2. Or use the image URLs in the extracted files")
    
  } catch (error) {
    console.error("❌ Extraction failed:", error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error("Extraction error:", error)
    process.exit(1)
  })

