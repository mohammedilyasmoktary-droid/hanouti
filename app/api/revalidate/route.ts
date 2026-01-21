import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

/**
 * API route to revalidate cached pages
 * 
 * Usage:
 * POST /api/revalidate?path=/&secret=your-secret
 * 
 * Or visit: https://hanouti.vercel.app/api/revalidate?path=/&secret=revalidate-2024
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path") || "/"
  const secret = searchParams.get("secret")

  // Simple secret check (you can change this)
  if (secret !== "revalidate-2024") {
    return NextResponse.json(
      { error: "Invalid secret" },
      { status: 401 }
    )
  }

  try {
    // Revalidate the specified path
    revalidatePath(path)
    
    return NextResponse.json({
      revalidated: true,
      path,
      message: `Path ${path} revalidated successfully`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error revalidating path" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path") || "/"
  const secret = searchParams.get("secret")

  // Simple secret check
  if (secret !== "revalidate-2024") {
    return NextResponse.json(
      { error: "Invalid secret" },
      { status: 401 }
    )
  }

  try {
    // Revalidate the specified path
    revalidatePath(path)
    
    return NextResponse.json({
      revalidated: true,
      path,
      message: `Path ${path} revalidated successfully`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error revalidating path" },
      { status: 500 }
    )
  }
}

