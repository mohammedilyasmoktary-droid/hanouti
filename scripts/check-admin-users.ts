import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

async function checkAdminUsers() {
  const adminEmail = "admin@hanouti.ma"
  const adminPassword = "admin123"

  console.log("🔍 Checking all admin users...\n")

  // Find all users with admin email (case insensitive)
  const users = await prisma.user.findMany({
    where: {
      email: {
        equals: adminEmail,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
      createdAt: true,
    },
  })

  console.log(`Found ${users.length} user(s) with email "${adminEmail}":\n`)

  for (const user of users) {
    console.log("─".repeat(60))
    console.log(`ID: ${user.id}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log(`Password hash: ${user.password?.substring(0, 20)}...`)
    console.log(`Hash format: ${user.password?.substring(0, 7)}`)
    console.log(`Created: ${user.createdAt}`)
    
    if (user.password) {
      try {
        const isValid = await compare(adminPassword, user.password)
        console.log(`Password match: ${isValid ? "✅ YES" : "❌ NO"}`)
      } catch (error: any) {
        console.log(`Password comparison error: ${error.message}`)
      }
    } else {
      console.log("Password: ❌ NOT SET")
    }
    console.log()
  }

  // Also check exact match
  const exactUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
    },
  })

  if (exactUser) {
    console.log("─".repeat(60))
    console.log("Exact match user:")
    console.log(`ID: ${exactUser.id}`)
    console.log(`Email: ${exactUser.email}`)
    console.log(`Role: ${exactUser.role}`)
    if (exactUser.password) {
      const isValid = await compare(adminPassword, exactUser.password)
      console.log(`Password match: ${isValid ? "✅ YES" : "❌ NO"}`)
      console.log(`Hash: ${exactUser.password.substring(0, 30)}...`)
    }
  }
}

checkAdminUsers()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

