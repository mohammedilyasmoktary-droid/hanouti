import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
    // Test connection on initialization
    if (process.env.NODE_ENV === "development") {
      client.$connect().catch((err) => {
        console.warn("Prisma connection warning:", err)
      })
    }
    return client
  } catch (error) {
    console.error("Failed to create PrismaClient:", error)
    throw error
  }
}

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient()
} else {
  // In development, use global to prevent multiple instances during hot reload
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

// Verify prisma is defined
if (!prisma) {
  throw new Error("PrismaClient failed to initialize")
}

// Ensure we disconnect on process exit
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}

export { prisma }
