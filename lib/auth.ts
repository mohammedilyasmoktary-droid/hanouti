import CredentialsProvider from "next-auth/providers/credentials"
import { getToken } from "next-auth/jwt"
import { headers } from "next/headers"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"

// Validate secret is set
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
if (!secret || secret === "change-this-in-production") {
  console.error("[Auth] WARNING: NEXTAUTH_SECRET or AUTH_SECRET is not set or using default value!")
}

export const authOptions = {
  secret: secret || "change-this-in-production",
  trustHost: true, // Required for NextAuth v5 in production
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[Auth] Missing credentials")
            return null
          }

          // Normalize email to lowercase to avoid case sensitivity issues
          const email = (credentials.email as string).toLowerCase().trim()
          // Trim password to avoid whitespace issues
          const password = (credentials.password as string).trim()

          console.log("[Auth] ========== LOGIN ATTEMPT ==========")
          console.log("[Auth] Email:", email)
          console.log("[Auth] Password length:", password.length)
          console.log("[Auth] Password (first 2 chars):", password.substring(0, 2) + "***")
          console.log("[Auth] Database URL present:", !!process.env.DATABASE_URL)
          console.log("[Auth] Prisma client available:", !!prisma)

          let user
          try {
            user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
              },
            })
            console.log("[Auth] Database query completed, user found:", !!user)
            if (user) {
              console.log("[Auth] User details - Email:", user.email, "Role:", user.role, "Has password:", !!user.password)
            }
          } catch (dbError: any) {
            console.error("[Auth] Database query failed:", dbError)
            console.error("[Auth] Database error message:", dbError?.message)
            console.error("[Auth] Database error code:", dbError?.code)
            throw dbError // Re-throw to be caught by outer catch
          }

          if (!user) {
            console.log("[Auth] User not found:", email)
            return null
          }

          if (!user.password) {
            console.log("[Auth] User has no password set:", email)
            return null
          }

          console.log("[Auth] User found, checking password...")
          console.log("[Auth] Password hash length:", user.password?.length || 0)
          console.log("[Auth] Password hash (first 10 chars):", user.password?.substring(0, 10) || "N/A")

          let isValid = false
          try {
            // Compare password - trim password but NEVER trim the hash!
            // Bcrypt hashes are fixed format and trimming breaks them
            const trimmedPassword = password.trim()
            isValid = await compare(trimmedPassword, user.password)
            console.log("[Auth] Password comparison result:", isValid)
            if (!isValid) {
              console.log("[Auth] Password mismatch!")
              console.log("[Auth] Input password length:", trimmedPassword.length)
              console.log("[Auth] Hash length:", user.password.length)
              console.log("[Auth] Hash format:", user.password.substring(0, 7))
            }
          } catch (compareError: any) {
            console.error("[Auth] Password comparison failed:", compareError)
            throw compareError
          }

          if (!isValid) {
            console.log("[Auth] Invalid password for:", email)
            return null
          }

          console.log("[Auth] Login successful for:", email, "Role:", user.role)

          // Return user object in format expected by NextAuth
          const userObject = {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
          }
          
          console.log("[Auth] Returning user object:", { id: userObject.id, email: userObject.email, role: userObject.role })
          
          return userObject
        } catch (error: any) {
          console.error("[Auth] ========== AUTHORIZATION ERROR ==========")
          console.error("[Auth] Error during authorization:", error)
          console.error("[Auth] Error name:", error?.name)
          console.error("[Auth] Error message:", error?.message)
          console.error("[Auth] Error stack:", error?.stack)
          console.error("[Auth] Error code:", error?.code)
          console.error("[Auth] =========================================")
          // Return null so NextAuth handles it as invalid credentials
          // But log extensively so we can see what's failing
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      try {
        if (user) {
          token.id = user.id
          token.role = (user as any).role || "CUSTOMER"
          token.email = user.email
          token.name = user.name
        }
        return token
      } catch (error) {
        console.error("[Auth] Error in jwt callback:", error)
        return token
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (session.user) {
          session.user.id = token.id as string
          session.user.role = (token.role as "ADMIN" | "CUSTOMER") || "CUSTOMER"
          session.user.email = token.email as string
          session.user.name = token.name as string | null
        }
        return session
      } catch (error) {
        console.error("[Auth] Error in session callback:", error)
        return session
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        // Ensure baseUrl is set (required for production)
        const finalBaseUrl = baseUrl || process.env.NEXTAUTH_URL || "https://hanouti-omega.vercel.app"
        
        // Always redirect admin users to /admin
        if (url.includes("/admin") || url === finalBaseUrl || url === `${finalBaseUrl}/`) {
          return `${finalBaseUrl}/admin`
        }
        if (url.startsWith("/")) {
          return `${finalBaseUrl}${url}`
        }
        if (url.startsWith(finalBaseUrl)) {
          return url
        }
        return finalBaseUrl
      } catch (error) {
        console.error("[Auth] Error in redirect callback:", error)
        const fallbackUrl = process.env.NEXTAUTH_URL || "https://hanouti-omega.vercel.app"
        return fallbackUrl
      }
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}

// Helper function to get server session for NextAuth v5 beta
export async function getServerSession() {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "change-this-in-production"
    
    let cookieHeader = ""
    try {
      const headersList = await headers()
      cookieHeader = headersList.get("cookie") || ""
    } catch (e) {
      console.warn("Could not get headers in getServerSession:", e)
      return null
    }
    
    const token = await getToken({
      req: {
        headers: {
          cookie: cookieHeader,
        },
      } as any,
      secret,
    })

    if (!token) {
      return null
    }

    // Return session-like object compatible with NextAuth session structure
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string | null,
        role: (token.role as "ADMIN" | "CUSTOMER") || "CUSTOMER",
      },
      expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
    }
  } catch (error) {
    console.error("Error in getServerSession:", error)
    return null
  }
}

