import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Format d'email invalide").optional().nullable(),
  phone: z.string().optional().nullable(),
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = contactSchema.parse(body)

    // Ensure at least one contact method is provided
    if (!data.email && !data.phone) {
      return NextResponse.json(
        { error: "Veuillez fournir au moins un email ou un numéro de téléphone" },
        { status: 400 }
      )
    }

    // Create contact message
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      },
    })

    return NextResponse.json(
      { success: true, message: "Message envoyé avec succès", id: message.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating contact message:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    )
  }
}


