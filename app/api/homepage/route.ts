import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const revalidate = 60

export async function GET() {
  try {
    const contents = await prisma.homepageContent.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        section: "asc",
      },
    })

    // Parse JSON data for each section and create a map
    const contentMap: Record<string, any> = {}
    contents.forEach((content) => {
      try {
        contentMap[content.section] = JSON.parse(content.data)
      } catch (e) {
        console.error(`Error parsing content for section ${content.section}:`, e)
      }
    })

    return NextResponse.json(contentMap, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error("Error fetching homepage content:", error)
    return NextResponse.json({}, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }) // Return empty object on error, homepage will use defaults
  }
}


