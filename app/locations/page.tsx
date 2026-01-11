import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, Truck, ExternalLink } from "lucide-react"

const locations = [
  {
    id: "main",
    name: "Hanouti - Magasin Principal",
    address: "123 Avenue Mohammed V",
    city: "Casablanca 20000",
    country: "Maroc",
    phone: "+212 522-123456",
    email: "contact@hanouti.ma",
    openingHours: {
      monday: { open: "09:00", close: "20:00" },
      tuesday: { open: "09:00", close: "20:00" },
      wednesday: { open: "09:00", close: "20:00" },
      thursday: { open: "09:00", close: "20:00" },
      friday: { open: "09:00", close: "20:00" },
      saturday: { open: "09:00", close: "20:00" },
      sunday: { open: "10:00", close: "18:00" },
    },
    googleMapsUrl: "https://maps.google.com/?q=33.5731,-7.5898",
    deliveryZones: [
      "Casablanca Centre",
      "Aïn Diab",
      "Anfa",
      "Maârif",
      "Gauthier",
      "Sidi Belyout",
      "Ain Sebaâ",
      "Hay Hassani",
    ],
    notes: "Livraison gratuite pour les commandes de plus de 200 MAD. Zone de livraison: 15 km autour du magasin.",
  },
]

const dayLabels: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
}

export default function LocationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Container className="py-10 sm:py-12">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">
              Nos points de vente
            </h1>
            <p className="text-sm text-zinc-600">
              Retrouvez nos magasins et zones de livraison
            </p>
          </div>

          {/* Locations Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {locations.map((location) => (
              <Card key={location.id} className="border-zinc-200/60 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{location.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address */}
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Adresse
                    </h3>
                    <div className="text-sm text-zinc-600 space-y-1">
                      <p>{location.address}</p>
                      <p>{location.city}</p>
                      <p>{location.country}</p>
                    </div>
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ouvrir dans Google Maps
                    </a>
                  </div>

                  {/* Opening Hours */}
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Horaires d&apos;ouverture
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(location.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-zinc-600">{dayLabels[day]}</span>
                          <span className="font-medium text-zinc-900">
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Contact
                    </h3>
                    <div className="space-y-2 text-sm text-zinc-600">
                      <p>{location.phone}</p>
                      {location.email && (
                        <p>
                          <a
                            href={`mailto:${location.email}`}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {location.email}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Zones */}
                  {location.deliveryZones && location.deliveryZones.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-900 mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        Zones de livraison
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {location.deliveryZones.map((zone) => (
                          <span
                            key={zone}
                            className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                      {location.notes && (
                        <p className="mt-3 text-xs text-zinc-600">{location.notes}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="mt-8 border-zinc-200/60 rounded-2xl shadow-sm bg-zinc-50/50">
            <CardContent className="py-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-zinc-900">Besoin d&apos;aide ?</h3>
                <p className="text-sm text-zinc-600">
                  Notre équipe est disponible pour répondre à toutes vos questions.
                </p>
                <div className="pt-2">
                  <Button asChild variant="outline" className="rounded-xl">
                    <a href="/contact">Nous contacter</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  )
}


