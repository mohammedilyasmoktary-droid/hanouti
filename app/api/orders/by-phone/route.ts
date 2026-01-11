import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const phoneSchema = z.object({
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone } = phoneSchema.parse(body)

    const orders = await prisma.order.findMany({
      where: {
        customerPhone: phone,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert Decimal to number
    const ordersWithNumbers = orders.map((order) => ({
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }))

    return NextResponse.json(ordersWithNumbers)
  } catch (error) {
    console.error("Error fetching orders by phone:", error)
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Données invalides" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    )
  }
}

