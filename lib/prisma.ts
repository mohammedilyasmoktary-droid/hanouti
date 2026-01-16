import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  try {
    // During build, suppress all logs to prevent error noise
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1'
    
    // Optimize connection pooling for production
    const databaseUrl = process.env.DATABASE_URL
    const optimizedUrl = databaseUrl?.includes('pooler') 
      ? databaseUrl 
      : databaseUrl // Use existing URL if no pooler
    
    const client = new PrismaClient({
      log: isBuildTime ? [] : (process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]),
      datasources: {
        db: {
          url: optimizedUrl,
        },
      },
    })
    // Test connection on initialization (skip during build)
    if (process.env.NODE_ENV === "development" && !isBuildTime) {
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
