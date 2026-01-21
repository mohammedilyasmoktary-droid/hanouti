import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { z } from "zod"

const homepageContentSchema = z.object({
  section: z.enum(["hero", "categories", "products", "promos", "trust"]),
  data: z.any(), // JSON object
  isActive: z.boolean().optional().default(true),
})

export async function GET(req: Request) {
  try {
    // Get session from request cookies
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const cookieHeader = req.headers.get("cookie") || ""
    
    // Try multiple cookie names
    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ]
    
    let token: any = null
    for (const cookieName of cookieNames) {
      try {
        token = await getToken({
          req: {
            headers: {
              cookie: cookieHeader,
            },
          } as any,
          secret,
          cookieName,
        })
        if (token) break
      } catch (e) {
        continue
      }
    }

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contents = await prisma.homepageContent.findMany({
      orderBy: {
        section: "asc",
      },
    })

    // Parse JSON data for each section
    const parsedContents = contents.map((content) => ({
      ...content,
      data: JSON.parse(content.data),
    }))

    return NextResponse.json(parsedContents)
  } catch (error) {
    console.error("Error fetching homepage content:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Get session from request cookies
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const cookieHeader = req.headers.get("cookie") || ""
    
    // Try multiple cookie names
    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ]
    
    let token: any = null
    for (const cookieName of cookieNames) {
      try {
        token = await getToken({
          req: {
            headers: {
              cookie: cookieHeader,
            },
          } as any,
          secret,
          cookieName,
        })
        if (token) break
      } catch (e) {
        continue
      }
    }

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = homepageContentSchema.parse(body)

    // Upsert homepage content
    const content = await prisma.homepageContent.upsert({
      where: { section: data.section },
      update: {
        data: JSON.stringify(data.data),
        isActive: data.isActive ?? true,
      },
      create: {
        section: data.section,
        data: JSON.stringify(data.data),
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json({
      ...content,
      data: JSON.parse(content.data),
    })
  } catch (error) {
    console.error("Error saving homepage content:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


