import { PrismaClient } from "@prisma/client"
import { hash, compare } from "bcryptjs"

const prisma = new PrismaClient()

async function diagnoseAdminLogin() {
  const adminEmail = "admin@hanouti.ma"
  const adminPassword = "admin123"

  console.log("🔍 Diagnosing admin login issue...\n")
  console.log("=" .repeat(60))

  // Check environment
  console.log("\n1️⃣ Environment Check:")
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"}`)
  console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing"}`)
  console.log(`   AUTH_SECRET: ${process.env.AUTH_SECRET ? "✅ Set" : "❌ Missing"}`)
  console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || "⚠️  Not set (may cause issues)"}`)

  // Test database connection
  console.log("\n2️⃣ Database Connection Test:")
  try {
    await prisma.$connect()
    console.log("   ✅ Database connection successful")
  } catch (error: any) {
    console.log("   ❌ Database connection failed!")
    console.log(`   Error: ${error.message}`)
    await prisma.$disconnect()
    process.exit(1)
  }

  // Check if user exists
  console.log("\n3️⃣ User Check:")
  let user
  try {
    user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      console.log("   ❌ Admin user NOT FOUND in database!")
      console.log("   🔧 Creating admin user...")
      
      const hashedPassword = await hash(adminPassword, 12)
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Admin",
          password: hashedPassword,
          role: "ADMIN",
        },
      })
      console.log("   ✅ Admin user created successfully!")
    } else {
      console.log("   ✅ Admin user found:")
      console.log(`      ID: ${user.id}`)
      console.log(`      Email: ${user.email}`)
      console.log(`      Name: ${user.name || "N/A"}`)
      console.log(`      Role: ${user.role}`)
      console.log(`      Has password: ${!!user.password}`)
      console.log(`      Created: ${user.createdAt}`)
      console.log(`      Updated: ${user.updatedAt}`)
    }
  } catch (error: any) {
    console.log("   ❌ Error checking/creating user!")
    console.log(`   Error: ${error.message}`)
    await prisma.$disconnect()
    process.exit(1)
  }

  // Test password
  console.log("\n4️⃣ Password Verification:")
  if (!user || !user.password) {
    console.log("   ❌ No password set!")
    console.log("   🔧 Setting password...")
    
    const hashedPassword = await hash(adminPassword, 12)
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    console.log("   ✅ Password set successfully!")
  } else {
    try {
      const isValid = await compare(adminPassword, user.password)
      if (isValid) {
        console.log("   ✅ Password is correct!")
      } else {
        console.log("   ❌ Password doesn't match!")
        console.log("   🔧 Resetting password...")
        
        const hashedPassword = await hash(adminPassword, 12)
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            password: hashedPassword,
            role: "ADMIN",
          },
        })
        console.log("   ✅ Password reset successfully!")
      }
    } catch (error: any) {
      console.log("   ❌ Error comparing password!")
      console.log(`   Error: ${error.message}`)
    }
  }

  // Verify role
  console.log("\n5️⃣ Role Verification:")
  const finalCheck = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: {
      email: true,
      role: true,
      password: true,
    },
  })

  if (finalCheck) {
    if (finalCheck.role === "ADMIN") {
      console.log("   ✅ Role is ADMIN")
    } else {
      console.log(`   ⚠️  Role is ${finalCheck.role}, updating to ADMIN...`)
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "ADMIN" },
      })
      console.log("   ✅ Role updated to ADMIN")
    }
  }

  // Final verification
  console.log("\n6️⃣ Final Verification:")
  const verification = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: {
      email: true,
      role: true,
      password: true,
    },
  })

  if (verification && verification.password) {
    const isValid = await compare(adminPassword, verification.password)
    if (isValid && verification.role === "ADMIN") {
      console.log("   ✅ All checks passed!")
      console.log("\n" + "=".repeat(60))
      console.log("\n📝 Login Credentials:")
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      console.log("\n✅ Admin account is ready to use!")
    } else {
      console.log("   ❌ Verification failed!")
      if (!isValid) console.log("      - Password mismatch")
      if (verification.role !== "ADMIN") console.log(`      - Role is ${verification.role}, not ADMIN`)
      process.exit(1)
    }
  } else {
    console.log("   ❌ Verification failed - user or password missing!")
    process.exit(1)
  }
}

diagnoseAdminLogin()
  .catch((e) => {
    console.error("\n❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

