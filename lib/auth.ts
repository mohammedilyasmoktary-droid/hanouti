import CredentialsProvider from "next-auth/providers/credentials"
import { getToken } from "next-auth/jwt"
import { headers } from "next/headers"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "change-this-in-production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

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

        if (!user || !user.password) {
          return null
        }

        const isValid = await compare(password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "CUSTOMER"
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as "ADMIN" | "CUSTOMER") || "CUSTOMER"
        session.user.email = token.email as string
        session.user.name = token.name as string | null
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always redirect admin users to /admin
      if (url.includes("/admin") || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/admin`
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
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

