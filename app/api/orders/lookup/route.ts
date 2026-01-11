import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const lookupSchema = z.object({
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  orderNumber: z.string().min(1, "Le numéro de commande est requis"),
})

function normalizePhone(phone: string): string {
  // Remove all spaces, dashes, and parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, "")
  
  // Handle +212 prefix
  if (normalized.startsWith("+212")) {
    normalized = normalized.substring(4)
  }
  
  // Handle 00212 prefix
  if (normalized.startsWith("00212")) {
    normalized = normalized.substring(5)
  }
  
  // Remove leading 0 and add +212
  if (normalized.startsWith("0")) {
    normalized = normalized.substring(1)
  }
  
  // Ensure we have digits only
  normalized = normalized.replace(/\D/g, "")
  
  return normalized
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = lookupSchema.parse(body)

    // Normalize phone number for comparison
    const normalizedPhone = normalizePhone(data.phone.trim())
    const trimmedOrderNumber = data.orderNumber.trim().toUpperCase()

    // Validate normalized phone has reasonable length (Moroccan mobile: 9 digits after normalization)
    if (!normalizedPhone || normalizedPhone.length < 8) {
      return NextResponse.json(
        { error: "Numéro de téléphone invalide. Format attendu: +212 6XX XXX XXX ou 06XX XXX XXX" },
        { status: 400 }
      )
    }

    // Find order matching both phone and order number
    // Search for orders with matching orderNumber first, then filter by phone
    // This is more efficient and handles various phone formats stored in DB
    const orders = await prisma.order.findMany({
      where: {
        orderNumber: trimmedOrderNumber,
      },
      include: {
        items: {
          select: {
            id: true,
            nameFr: true,
            price: true,
            quantity: true,
          },
        },
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Commande introuvable. Vérifiez le numéro de commande." },
        { status: 404 }
      )
    }

    // Normalize phone numbers from database for comparison
    const matchingOrder = orders.find((o) => {
      const dbPhoneNormalized = normalizePhone(o.customerPhone)
      return dbPhoneNormalized === normalizedPhone
    })

    if (!matchingOrder) {
      return NextResponse.json(
        { error: "Commande introuvable. Le numéro de téléphone ne correspond pas à cette commande." },
        { status: 404 }
      )
    }

    const order = matchingOrder

    // Convert Decimal to number for client
    const orderWithNumbers = {
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }

    return NextResponse.json(orderWithNumbers)
  } catch (error) {
    console.error("Error looking up order:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erreur lors de la recherche de la commande" },
      { status: 500 }
    )
  }
}

