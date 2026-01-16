import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  try {
    // During build, suppress all logs to prevent error noise
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1'
    
    // Optimize connection pooling - use connection pooler URL if available
    const databaseUrl = process.env.DATABASE_URL || ""
    
    // For Supabase, prefer transaction mode pooler (port 6543) over session mode (limited connections)
    // Session mode pooler has very limited connections and causes "MaxClientsInSessionMode" errors
    let optimizedUrl = databaseUrl
    
    // If using pooler in session mode, try to switch to transaction mode if possible
    if (databaseUrl.includes('pooler.supabase.com') && databaseUrl.includes('/postgres')) {
      // Session mode uses limited connections - prefer direct connection or transaction pooler
      // Keep the URL as is, but ensure we're not opening too many connections
      optimizedUrl = databaseUrl
    }
    
    const client = new PrismaClient({
      log: isBuildTime ? [] : (process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]),
      datasources: {
        db: {
          url: optimizedUrl,
        },
      },
    })
    
    // Don't connect eagerly in production - let Prisma manage connections
    // This prevents opening connections before they're needed
    return client
  } catch (error) {
    console.error("Failed to create PrismaClient:", error)
    throw error
  }
}

// Ensure singleton Prisma Client instance
let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  // In production, always use a singleton instance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
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

// Handle connection cleanup on process exit
if (typeof process !== "undefined") {
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
  
  process.on("beforeExit", cleanup)
  process.on("SIGINT", cleanup)
  process.on("SIGTERM", cleanup)
}

export { prisma }
