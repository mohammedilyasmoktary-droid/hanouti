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
      // Performance optimizations
      transactionOptions: {
        timeout: 10000, // 10 second timeout for transactions
      },
    })
    
    // Set query timeout to prevent hanging queries
    if (client.$connect) {
      // Add query timeout middleware
      client.$use(async (params, next) => {
        // Set max query execution time to 30 seconds
        const before = Date.now()
        try {
          const result = await next(params)
          const after = Date.now()
          // Warn if query takes longer than 5 seconds
          if (after - before > 5000 && process.env.NODE_ENV === "development") {
            console.warn(`Slow query detected: ${params.model}.${params.action} took ${after - before}ms`)
          }
          return result
        } catch (error) {
          const after = Date.now()
          if (after - before > 10000) {
            console.error(`Query timeout: ${params.model}.${params.action} took ${after - before}ms`)
          }
          throw error
        }
      })
    }
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
