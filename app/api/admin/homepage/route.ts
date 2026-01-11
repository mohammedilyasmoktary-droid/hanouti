import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/auth"
import { z } from "zod"

const homepageContentSchema = z.object({
  section: z.enum(["hero", "categories", "products", "promos", "trust"]),
  data: z.any(), // JSON object
  isActive: z.boolean().optional().default(true),
})

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user || session.user.role !== "ADMIN") {
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
    const session = await getServerSession()
    if (!session?.user || session.user.role !== "ADMIN") {
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


