import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

export const revalidate = 0

async function getMessages() {
  return await prisma.contactMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function AdminMessagesPage() {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin")
  }

  const messages = await getMessages()

  return (
    <div className="flex min-h-screen flex-col">
      <Container className="py-10 sm:py-12">
        {/* Page Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">
            Messages de contact
          </h1>
          <p className="text-sm text-zinc-600">
            {messages.length} message{messages.length > 1 ? "s" : ""} reçu{messages.length > 1 ? "s" : ""}
          </p>
        </div>

        {messages.length > 0 ? (
          <>
            {/* Mobile: Card layout */}
            <div className="lg:hidden space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className="border-zinc-200/60 rounded-lg shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{message.name}</h3>
                        <p className="text-xs text-zinc-600 mt-1">
                          {format(new Date(message.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {message.subject}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {message.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-zinc-500" />
                          <a
                            href={`mailto:${message.email}`}
                            className="text-primary hover:underline break-all"
                          >
                            {message.email}
                          </a>
                        </div>
                      )}
                      {message.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-zinc-500" />
                          <a
                            href={`tel:${message.phone}`}
                            className="text-primary hover:underline"
                          >
                            {message.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t border-zinc-200">
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <Card className="hidden lg:block border-zinc-200/60 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Liste des messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Sujet</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="text-sm text-zinc-600">
                            {format(new Date(message.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell className="font-medium">{message.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              {message.email && (
                                <div className="flex items-center gap-2 text-zinc-600">
                                  <Mail className="h-3 w-3" />
                                  <a
                                    href={`mailto:${message.email}`}
                                    className="text-primary hover:underline"
                                  >
                                    {message.email}
                                  </a>
                                </div>
                              )}
                              {message.phone && (
                                <div className="flex items-center gap-2 text-zinc-600">
                                  <Phone className="h-3 w-3" />
                                  <a
                                    href={`tel:${message.phone}`}
                                    className="text-primary hover:underline"
                                  >
                                    {message.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{message.subject}</TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-zinc-600 line-clamp-2 group-open:line-clamp-none">
                                  {message.message}
                                </summary>
                              </details>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-zinc-900">Aucun message</h3>
              <p className="text-sm text-zinc-600">
                Aucun message de contact n&apos;a été reçu pour le moment.
              </p>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  )
}

