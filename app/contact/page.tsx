"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const storeInfo = {
  name: "Hanouti",
  email: "contact@hanouti.ma",
  phone: "+212 522-123456",
  address: "123 Avenue Mohammed V, Casablanca 20000, Maroc",
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = "Veuillez fournir au moins un email ou un numéro de téléphone"
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Le sujet est requis"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis"
    }

    if (formData.message.trim().length < 10) {
      newErrors.message = "Le message doit contenir au moins 10 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setSubmitError(data.error || "Une erreur est survenue. Veuillez réessayer.")
      }
    } catch (err) {
      console.error("Error submitting contact form:", err)
      setSubmitError("Une erreur réseau est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Container className="py-10 sm:py-12">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-zinc-900">
              Nous contacter
            </h1>
            <p className="text-sm text-zinc-600">
              Une question ? Une suggestion ? N&apos;hésitez pas à nous écrire
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <Card className="mb-8 border-green-200 bg-green-50 rounded-2xl shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Message envoyé avec succès !</h3>
                    <p className="text-sm text-green-700">
                      Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {submitError && (
            <Card className="mb-8 border-red-200 bg-red-50 rounded-2xl shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Erreur</h3>
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ahmed Benali"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (errors.name) setErrors({ ...errors, name: "" })
                        }}
                        className="mt-2"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ahmed@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (errors.email || errors.contact) {
                              setErrors({ ...errors, email: "", contact: "" })
                            }
                          }}
                          className="mt-2"
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+212 6XX XXX XXX"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value })
                            if (errors.contact) setErrors({ ...errors, contact: "" })
                          }}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {errors.contact && (
                      <p className="text-xs text-red-600">{errors.contact}</p>
                    )}

                    <div>
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Objet de votre message"
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData({ ...formData, subject: e.target.value })
                          if (errors.subject) setErrors({ ...errors, subject: "" })
                        }}
                        className="mt-2"
                        aria-invalid={!!errors.subject}
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-600 mt-1">{errors.subject}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Votre message..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value })
                          if (errors.message) setErrors({ ...errors, message: "" })
                        }}
                        className="mt-2"
                        aria-invalid={!!errors.message}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-600 mt-1">{errors.message}</p>
                      )}
                      <p className="text-xs text-zinc-500 mt-1">
                        Minimum 10 caractères
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Store Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-zinc-200/60 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-900 mb-1">Adresse</h3>
                        <p className="text-sm text-zinc-600">{storeInfo.address}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-900 mb-1">Téléphone</h3>
                        <a
                          href={`tel:${storeInfo.phone}`}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {storeInfo.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-900 mb-1">Email</h3>
                        <a
                          href={`mailto:${storeInfo.email}`}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {storeInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200">
                    <h3 className="font-semibold text-sm text-zinc-900 mb-2">Horaires de service</h3>
                    <div className="space-y-1 text-sm text-zinc-600">
                      <p>Lundi - Samedi: 9h - 20h</p>
                      <p>Dimanche: 10h - 18h</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <a href="/locations">Voir nos magasins</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}


