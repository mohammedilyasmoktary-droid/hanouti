import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

async function testLogin() {
  const email = "admin@hanouti.ma"
  const password = "admin123"

  console.log("🧪 Testing login flow...\n")

  try {
    // Step 1: Find user
    console.log("1️⃣ Finding user...")
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    })

    if (!user) {
      console.log("❌ User not found!")
      return
    }

    console.log("✅ User found:")
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Has password: ${!!user.password}`)

    if (!user.password) {
      console.log("❌ User has no password!")
      return
    }

    // Step 2: Compare password
    console.log("\n2️⃣ Comparing password...")
    const isValid = await compare(password, user.password)

    if (!isValid) {
      console.log("❌ Password comparison failed!")
      console.log(`   Input password: ${password}`)
      console.log(`   Stored hash: ${user.password.substring(0, 20)}...`)
      return
    }

    console.log("✅ Password is valid!")

    // Step 3: Check role
    console.log("\n3️⃣ Checking role...")
    if (user.role !== "ADMIN") {
      console.log(`⚠️  Warning: User role is ${user.role}, not ADMIN`)
    } else {
      console.log("✅ Role is ADMIN")
    }

    console.log("\n✅ All checks passed! Login should work.")
    console.log("\n📝 Credentials:")
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)

  } catch (error) {
    console.error("❌ Error:", error)
  }
}

testLogin()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


