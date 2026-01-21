/**
 * Migration Script: Supabase to Neon
 * 
 * This script exports data from Supabase and imports it to Neon
 * 
 * Usage:
 * 1. Set OLD_DATABASE_URL in .env.local (Supabase connection string)
 * 2. Set DATABASE_URL in .env.local (Neon connection string - already set)
 * 3. Run: npx tsx scripts/migrate-from-supabase.ts
 */

import { PrismaClient } from "@prisma/client"

// Supabase database (old)
const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
})

// Neon database (new)
const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function migrateData() {
  console.log("🚀 Starting data migration from Supabase to Neon...\n")

  try {
    // 1. Migrate Categories
    console.log("📦 Migrating Categories...")
    const categories = await oldPrisma.category.findMany({
      include: {
        children: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Migrate parent categories first
    const parentCategories = categories.filter((cat) => !cat.parentId)
    console.log(`   Found ${parentCategories.length} parent categories`)

    for (const category of parentCategories) {
      try {
        await newPrisma.category.create({
          data: {
            id: category.id,
            nameFr: category.nameFr,
            nameAr: category.nameAr,
            slug: category.slug,
            imageUrl: category.imageUrl,
            parentId: null,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          },
        })
        console.log(`   ✅ Migrated category: ${category.nameFr}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Category already exists: ${category.nameFr}`)
        } else {
          console.error(`   ❌ Error migrating category ${category.nameFr}:`, error.message)
        }
      }
    }

    // Migrate child categories
    const childCategories = categories.filter((cat) => cat.parentId)
    console.log(`   Found ${childCategories.length} child categories`)

    for (const category of childCategories) {
      try {
        await newPrisma.category.create({
          data: {
            id: category.id,
            nameFr: category.nameFr,
            nameAr: category.nameAr,
            slug: category.slug,
            imageUrl: category.imageUrl,
            parentId: category.parentId,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          },
        })
        console.log(`   ✅ Migrated child category: ${category.nameFr}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Category already exists: ${category.nameFr}`)
        } else {
          console.error(`   ❌ Error migrating category ${category.nameFr}:`, error.message)
        }
      }
    }

    // 2. Migrate Products
    console.log("\n📦 Migrating Products...")
    const products = await oldPrisma.product.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })

    console.log(`   Found ${products.length} products`)

    for (const product of products) {
      try {
        await newPrisma.product.create({
          data: {
            id: product.id,
            nameFr: product.nameFr,
            nameAr: product.nameAr,
            slug: product.slug,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId,
            isActive: product.isActive,
            stock: product.stock,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
        })
        console.log(`   ✅ Migrated product: ${product.nameFr}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Product already exists: ${product.nameFr}`)
        } else if (error.code === "P2003") {
          console.log(`   ⚠️  Category not found for product ${product.nameFr}, skipping...`)
        } else {
          console.error(`   ❌ Error migrating product ${product.nameFr}:`, error.message)
        }
      }
    }

    // 3. Migrate Users
    console.log("\n👤 Migrating Users...")
    const users = await oldPrisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })

    console.log(`   Found ${users.length} users`)

    for (const user of users) {
      try {
        await newPrisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        console.log(`   ✅ Migrated user: ${user.email}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  User already exists: ${user.email}`)
        } else {
          console.error(`   ❌ Error migrating user ${user.email}:`, error.message)
        }
      }
    }

    // 4. Migrate Orders
    console.log("\n📋 Migrating Orders...")
    const orders = await oldPrisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    console.log(`   Found ${orders.length} orders`)

    for (const order of orders) {
      try {
        // Create order first
        await newPrisma.order.create({
          data: {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            deliveryMethod: order.deliveryMethod,
            address: order.address,
            city: order.city,
            notes: order.notes,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          },
        })

        // Create order items
        for (const item of order.items) {
          try {
            await newPrisma.orderItem.create({
              data: {
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                nameFr: item.nameFr,
                price: item.price,
                quantity: item.quantity,
                createdAt: item.createdAt,
              },
            })
          } catch (error: any) {
            console.error(`   ❌ Error migrating order item ${item.id}:`, error.message)
          }
        }

        console.log(`   ✅ Migrated order: ${order.orderNumber}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Order already exists: ${order.orderNumber}`)
        } else {
          console.error(`   ❌ Error migrating order ${order.orderNumber}:`, error.message)
        }
      }
    }

    // 5. Migrate Contact Messages
    console.log("\n💬 Migrating Contact Messages...")
    const messages = await oldPrisma.contactMessage.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })

    console.log(`   Found ${messages.length} contact messages`)

    for (const message of messages) {
      try {
        await newPrisma.contactMessage.create({
          data: {
            id: message.id,
            name: message.name,
            email: message.email,
            phone: message.phone,
            subject: message.subject,
            message: message.message,
            createdAt: message.createdAt,
          },
        })
        console.log(`   ✅ Migrated message: ${message.subject}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Message already exists: ${message.subject}`)
        } else {
          console.error(`   ❌ Error migrating message ${message.subject}:`, error.message)
        }
      }
    }

    // 6. Migrate Homepage Content
    console.log("\n🏠 Migrating Homepage Content...")
    const homepageContent = await oldPrisma.homepageContent.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })

    console.log(`   Found ${homepageContent.length} homepage content items`)

    for (const content of homepageContent) {
      try {
        await newPrisma.homepageContent.create({
          data: {
            id: content.id,
            section: content.section,
            data: content.data,
            isActive: content.isActive,
            createdAt: content.createdAt,
            updatedAt: content.updatedAt,
          },
        })
        console.log(`   ✅ Migrated homepage content: ${content.section}`)
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Homepage content already exists: ${content.section}`)
        } else {
          console.error(`   ❌ Error migrating homepage content ${content.section}:`, error.message)
        }
      }
    }

    console.log("\n✅ Migration completed successfully!")
    console.log("\nSummary:")
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Products: ${products.length}`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Orders: ${orders.length}`)
    console.log(`   - Contact Messages: ${messages.length}`)
    console.log(`   - Homepage Content: ${homepageContent.length}`)

  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

// Run migration
migrateData()
  .catch((error) => {
    console.error("Migration error:", error)
    process.exit(1)
  })

