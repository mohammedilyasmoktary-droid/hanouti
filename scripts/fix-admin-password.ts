import { PrismaClient } from "@prisma/client"
import { hash, compare } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "admin@hanouti.ma"
  const adminPassword = "admin123"

  console.log("🔍 Checking admin user...")

  // Check if admin exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
    },
  })

  if (!existingUser) {
    console.log("❌ Admin user not found. Creating...")
    const hashedPassword = await hash(adminPassword, 12)
    
    const newUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    
    console.log("✅ Admin user created!")
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Role: ${newUser.role}`)
  } else {
    console.log("✅ Admin user exists!")
    console.log(`   Email: ${existingUser.email}`)
    console.log(`   Role: ${existingUser.role}`)
    
    // Test password
    if (existingUser.password) {
      const isValid = await compare(adminPassword, existingUser.password)
      if (isValid) {
        console.log("✅ Password is correct!")
      } else {
        console.log("❌ Password doesn't match. Resetting...")
        const hashedPassword = await hash(adminPassword, 12)
        
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            password: hashedPassword,
            role: "ADMIN", // Ensure role is ADMIN
          },
        })
        
        console.log("✅ Password reset successfully!")
      }
    } else {
      console.log("❌ No password set. Setting password...")
      const hashedPassword = await hash(adminPassword, 12)
      
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: "ADMIN",
        },
      })
      
      console.log("✅ Password set successfully!")
    }
  }

  // Verify one more time
  console.log("\n🔍 Final verification...")
  const finalCheck = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: {
      email: true,
      role: true,
      password: true,
    },
  })

  if (finalCheck && finalCheck.password) {
    const isValid = await compare(adminPassword, finalCheck.password)
    if (isValid && finalCheck.role === "ADMIN") {
      console.log("✅ Everything is correct!")
      console.log(`\n📝 Login credentials:`)
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
    } else {
      console.log("❌ Verification failed!")
      process.exit(1)
    }
  } else {
    console.log("❌ Verification failed - user or password missing!")
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


