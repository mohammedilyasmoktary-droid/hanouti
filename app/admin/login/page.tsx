"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Create a timeout promise
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Login timeout after 15 seconds"))
      }, 15000)
    })

    try {
      console.log("[Login] Starting login attempt for:", email)
      
      // Use redirect: false to handle errors, then manually redirect on success
      // This ensures we can show error messages while still properly setting cookies
      const result = await Promise.race([
        signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/admin",
        }),
        timeout,
      ]) as any

      console.log("[Login] Result received:", result)

      if (result?.error) {
        console.error("[Login] Error:", result.error)
        setError("Email ou mot de passe incorrect")
        setLoading(false)
        return
      }

      if (result?.ok === false) {
        console.error("[Login] Login failed")
        setError("Email ou mot de passe incorrect")
        setLoading(false)
        return
      }

      if (result?.ok && result?.url) {
        console.log("[Login] Success! Redirecting to:", result.url)
        // Use the URL from NextAuth result - it includes proper callback handling
        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 200))
        window.location.href = result.url
        return
      }

      // Fallback: if no URL but ok is true, redirect to admin
      if (result?.ok) {
        console.log("[Login] Success! Redirecting to /admin")
        await new Promise(resolve => setTimeout(resolve, 200))
        window.location.href = "/admin"
        return
      }
    } catch (err: any) {
      console.error("[Login] Exception:", err)
      if (err?.message?.includes("timeout")) {
        setError("La connexion prend trop de temps. Vérifiez votre connexion et réessayez.")
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Connexion Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hanouti.ma"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 shadow-xs">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

