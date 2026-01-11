import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import React from "react"
import { renderToStream } from "@react-pdf/renderer"
import { ReceiptTemplate } from "@/components/receipt/receipt-template"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Fetch order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      )
    }

    // Convert Decimal to number for PDF generation
    const orderData = {
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
      createdAt: order.createdAt.toISOString(),
    }

    // Generate PDF
    const doc = React.createElement(ReceiptTemplate, { order: orderData }) as any
    const stream = await renderToStream(doc)

    // Return PDF stream as response
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${order.orderNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération du reçu" },
      { status: 500 }
    )
  }
}

