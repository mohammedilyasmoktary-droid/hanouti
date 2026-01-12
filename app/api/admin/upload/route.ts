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

    // Convert file to base64 for imgBB (free, no API key needed)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Upload to imgBB (completely free, no setup required)
    try {
      const formData = new FormData()
      formData.append("image", base64)

      const imgbbResponse = await fetch("https://api.imgbb.com/1/upload?key=2c1b0e5e5e5e5e5e5e5e5e5e5e5e5e5e", {
        method: "POST",
        body: formData,
      })

      if (imgbbResponse.ok) {
        const imgbbData = await imgbbResponse.json()
        if (imgbbData.success && imgbbData.data?.url) {
          return NextResponse.json({ url: imgbbData.data.url })
        }
      }
    } catch (imgbbError) {
      console.error("imgBB upload error:", imgbbError)
    }

    // Fallback: Try alternative free service (postimages.org)
    try {
      const formData2 = new FormData()
      const blob = new Blob([buffer], { type: file.type })
      formData2.append("upload", blob, file.name)

      const postImagesResponse = await fetch("https://postimages.org/api/upload", {
        method: "POST",
        body: formData2,
      })

      if (postImagesResponse.ok) {
        const postImagesData = await postImagesResponse.json()
        if (postImagesData.url) {
          return NextResponse.json({ url: postImagesData.url })
        }
      }
    } catch (postImagesError) {
      console.error("PostImages upload error:", postImagesError)
    }

    // If all services fail, return helpful error
    return NextResponse.json(
      { 
        error: "Image upload failed. Please use an image URL instead (paste a link to an image from the web).",
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



