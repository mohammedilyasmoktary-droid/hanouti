/**
 * Upload Extracted Images to Database
 * 
 * This script uploads the extracted image files to freeimage.host
 * and updates the database with the image URLs.
 * 
 * Usage:
 * npx tsx scripts/upload-extracted-images.ts
 */

import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

// Upload image file to freeimage.host
async function uploadImageFile(filePath: string): Promise<string | null> {
  try {
    // Read image file
    const imageBuffer = fs.readFileSync(filePath)
    const base64 = imageBuffer.toString("base64")
    
    // Try freeimage.host first
    try {
      const response = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "6d207e02198a847aa98d0a2a",
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
    } catch (error) {
      // Continue to next option
    }
    
    // Try Imgur as fallback
    try {
      const imgurResponse = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          "Authorization": "Client-ID 546c25a59c58ad7",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          type: "base64",
        }),
      })

      if (imgurResponse.ok) {
        const imgurData = await imgurResponse.json()
        if (imgurData.success && imgurData.data && imgurData.data.link) {
          return imgurData.data.link
        }
      }
    } catch (error) {
      // Continue
    }
    
    return null
  } catch (error) {
    console.error(`   ❌ Error uploading file:`, error)
    return null
  }
}

async function uploadCategoryImages() {
  const imagesDir = path.join(process.cwd(), "scripts", "data", "images", "categories")
  
  if (!fs.existsSync(imagesDir)) {
    console.log("⚠️  No category images directory found, skipping...")
    return
  }
  
  console.log("🖼️  Uploading category images...")
  
  const imageFiles = fs.readdirSync(imagesDir).filter(file => 
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  )
  
  console.log(`   Found ${imageFiles.length} image files`)
  
  let uploaded = 0
  let failed = 0
  let skipped = 0
  
  for (const filename of imageFiles) {
    const filePath = path.join(imagesDir, filename)
    const slug = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
    
    try {
      // Find category by slug
      const category = await prisma.category.findFirst({
        where: {
          slug: slug
        }
      })
      
      if (!category) {
        console.log(`   ⚠️  Category not found for: ${filename}`)
        skipped++
        continue
      }
      
      // Skip if already has image URL (not base64)
      if (category.imageUrl && !category.imageUrl.startsWith("data:image")) {
        console.log(`   ℹ️  Category already has image: ${category.nameFr}`)
        skipped++
        continue
      }
      
      console.log(`   📤 Uploading: ${category.nameFr}...`)
      
      // Upload image
      const imageUrl = await uploadImageFile(filePath)
      
      if (imageUrl) {
        // Update database
        await prisma.category.update({
          where: { id: category.id },
          data: { imageUrl: imageUrl }
        })
        
        console.log(`   ✅ Updated: ${category.nameFr}`)
        uploaded++
        
        // Rate limiting - wait 1 second between uploads
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        console.log(`   ❌ Failed to upload: ${category.nameFr}`)
        failed++
      }
    } catch (error: any) {
      console.error(`   ❌ Error processing ${filename}:`, error.message)
      failed++
    }
  }
  
  console.log(`\n📊 Category Images Summary:`)
  console.log(`   Uploaded: ${uploaded}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Failed: ${failed}`)
}

async function uploadProductImages() {
  const imagesDir = path.join(process.cwd(), "scripts", "data", "images", "products")
  
  if (!fs.existsSync(imagesDir)) {
    console.log("⚠️  No product images directory found, skipping...")
    return
  }
  
  console.log("\n🖼️  Uploading product images...")
  
  const imageFiles = fs.readdirSync(imagesDir).filter(file => 
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  )
  
  console.log(`   Found ${imageFiles.length} image files`)
  
  let uploaded = 0
  let failed = 0
  let skipped = 0
  
  for (const filename of imageFiles) {
    const filePath = path.join(imagesDir, filename)
    const slug = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
    
    try {
      // Find product by slug
      const product = await prisma.product.findFirst({
        where: {
          slug: slug
        }
      })
      
      if (!product) {
        skipped++
        continue
      }
      
      // Skip if already has image URL (not base64)
      if (product.imageUrl && !product.imageUrl.startsWith("data:image")) {
        skipped++
        continue
      }
      
      if (uploaded % 10 === 0) {
        console.log(`   📤 Uploading ${uploaded}/${imageFiles.length}...`)
      }
      
      // Upload image
      const imageUrl = await uploadImageFile(filePath)
      
      if (imageUrl) {
        // Update database
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: imageUrl }
        })
        
        uploaded++
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        failed++
      }
    } catch (error: any) {
      failed++
    }
  }
  
  console.log(`\n📊 Product Images Summary:`)
  console.log(`   Uploaded: ${uploaded}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Failed: ${failed}`)
}

async function main() {
  console.log("🚀 Starting image upload...\n")
  
  try {
    await uploadCategoryImages()
    await uploadProductImages()
    
    console.log("\n✅ Image upload completed!")
    console.log("\n💡 Refresh your website to see the images!")
    
  } catch (error) {
    console.error("❌ Upload failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error("Upload error:", error)
    process.exit(1)
  })

