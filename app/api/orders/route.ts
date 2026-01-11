import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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
  
  // Remove leading 0
  if (normalized.startsWith("0")) {
    normalized = normalized.substring(1)
  }
  
  // Ensure we have digits only
  normalized = normalized.replace(/\D/g, "")
  
  return normalized
}

const orderSchema = z.object({
  customerName: z.string().min(1, "Le nom est requis"),
  customerPhone: z.string().min(1, "Le téléphone est requis"),
  customerEmail: z.string().email().optional().nullable(),
  deliveryMethod: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      nameFr: z.string(),
      price: z.coerce.number().positive(),
      quantity: z.coerce.number().int().positive(),
    })
  ).min(1, "Au moins un article est requis"),
})

async function generateUniqueOrderNumber(): Promise<string> {
  let orderNumber: string
  let attempts = 0
  const maxAttempts = 10

  do {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
    orderNumber = `ORD-${timestamp}-${random}`
    
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
    })
    
    if (!existing) {
      return orderNumber
    }
    
    attempts++
    // Small delay to avoid timestamp collisions
    await new Promise(resolve => setTimeout(resolve, 1))
  } while (attempts < maxAttempts)

  // Fallback with UUID-like suffix if still conflicted
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    // Verify all products exist, are active, and have sufficient stock
    const productIds = data.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs produits ne sont plus disponibles" },
        { status: 400 }
      )
    }

    // Check stock availability
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable: ${item.nameFr}` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.nameFr}. Stock disponible: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // Calculate total - Prisma accepts numbers for Decimal fields
    const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Generate unique order number
    const orderNumber = await generateUniqueOrderNumber()

    // Create order with items in a transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Normalize phone number before storing for consistency
      const normalizedCustomerPhone = normalizePhone(data.customerPhone.trim())

      // Create order - Prisma converts number to Decimal automatically
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName.trim(),
          customerPhone: normalizedCustomerPhone, // Store normalized phone
          customerEmail: data.customerEmail?.trim() || null,
          deliveryMethod: data.deliveryMethod,
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          notes: data.notes?.trim() || null,
          total, // Number - Prisma converts to Decimal
          status: "PENDING",
        },
      })

      // Create order items - Prisma converts numbers to Decimal automatically
      await tx.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          nameFr: item.nameFr,
          price: item.price, // Number - Prisma converts to Decimal
          quantity: item.quantity,
        })),
      })

      // Update product stock (only if sufficient stock exists)
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)
        if (product && product.stock >= item.quantity) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        } else {
          throw new Error(`Stock insuffisant pour ${item.nameFr}`)
        }
      }

      // Return order with items
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  nameFr: true,
                  slug: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      })
    })

    if (!order) {
      throw new Error("Failed to create order")
    }

    // Convert Decimal to number and Date to string for JSON response
    const orderResponse = {
      ...order,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        createdAt: item.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(orderResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides", details: error.issues },
        { status: 400 }
      )
    }
    
    // More specific error messages
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      
      if (error.message.includes("stock") || error.message.includes("Stock")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      if (error.message.includes("Unique constraint") || error.message.includes("unique")) {
        return NextResponse.json(
          { error: "Une erreur est survenue. Veuillez réessayer." },
          { status: 500 }
        )
      }
      if (error.message.includes("Foreign key") || error.message.includes("constraint")) {
        return NextResponse.json(
          { error: "Un ou plusieurs produits ne sont plus disponibles" },
          { status: 400 }
        )
      }
      // Return the actual error message for debugging (in production, you might want to hide this)
      return NextResponse.json(
        { error: error.message || "Erreur lors de la création de la commande" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la commande. Veuillez réessayer." },
      { status: 500 }
    )
  }
}

