import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function POST(req: Request) {
  try {
    // Get session from request cookies
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Get cookies from request headers
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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to base64 for Imgur
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Try Imgur first (free, no account needed)
    try {
      const imgurClientId = process.env.IMGUR_CLIENT_ID || "546c10a5c03a309"
      const imgurResponse = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          "Authorization": `Client-ID ${imgurClientId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          type: "base64",
        }),
      })

      if (imgurResponse.ok) {
        const imgurData = await imgurResponse.json()
        if (imgurData.success && imgurData.data?.link) {
          return NextResponse.json({ url: imgurData.data.link })
        }
      }
      
      // If Imgur fails, log but continue to alternative
      const errorData = await imgurResponse.json().catch(() => ({}))
      console.error("Imgur upload error:", errorData)
    } catch (imgurError) {
      console.error("Imgur request failed:", imgurError)
    }

    // Fallback: Use a simple image hosting service or return error
    // For now, we'll use a data URL approach or suggest URL input
    return NextResponse.json(
      { 
        error: "Image upload service is temporarily unavailable. Please use an image URL instead (paste a link to an image from the web).",
        code: "UPLOAD_SERVICE_UNAVAILABLE"
      },
      { status: 503 }
    )
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}



