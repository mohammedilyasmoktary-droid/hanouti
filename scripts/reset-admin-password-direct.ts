import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function resetPassword() {
  const adminEmail = "admin@hanouti.ma"
  const adminPassword = "admin123"

  console.log("🔄 Resetting admin password...")
  
  // Generate new hash
  const hashedPassword = await hash(adminPassword, 12)
  console.log("✅ Generated hash:", hashedPassword.substring(0, 20) + "...")
  
  // Update the user
  const updated = await prisma.user.update({
    where: { email: adminEmail },
    data: {
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  
  console.log("✅ Password updated!")
  console.log("   Email:", updated.email)
  console.log("   Role:", updated.role)
  console.log("   Password hash:", updated.password.substring(0, 20) + "...")
  
  // Verify
  const { compare } = await import("bcryptjs")
  const isValid = await compare(adminPassword, updated.password)
  console.log("\n🔍 Verification:")
  console.log("   Password matches:", isValid ? "✅" : "❌")
  
  if (isValid) {
    console.log("\n✅ Password reset successful!")
    console.log("📝 Credentials:")
    console.log("   Email:", adminEmail)
    console.log("   Password:", adminPassword)
  } else {
    console.log("\n❌ Password verification failed!")
    process.exit(1)
  }
}

resetPassword()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

