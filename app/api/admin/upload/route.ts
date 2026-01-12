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

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Use freeimage.host API (completely free, no API key needed)
    try {
      const freeImageResponse = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "6d207e02198a847aa98d0a2a", // Public demo key
          source: base64,
          format: "json",
        }),
      })

      if (freeImageResponse.ok) {
        const freeImageData = await freeImageResponse.json()
        if (freeImageData.image && freeImageData.image.url) {
          return NextResponse.json({ url: freeImageData.image.url })
        }
      }
    } catch (freeImageError) {
      console.error("FreeImage upload error:", freeImageError)
    }

    // Fallback: Return data URL (works but images are stored in database)
    // This is a simple fallback that always works
    const dataUrl = `data:${file.type};base64,${base64}`
    
    // Note: Data URLs work but are large. For production, consider using a proper image hosting service.
    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}



