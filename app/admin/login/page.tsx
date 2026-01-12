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

    try {
      console.log("Attempting login...")
      
      // Try direct API call first to see if it works
      const response = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email,
          password,
          redirect: "false",
          callbackUrl: "/admin",
        }),
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API error:", errorData)
        setError("Email ou mot de passe incorrect")
        setLoading(false)
        return
      }

      // If API call succeeded, try signIn to set cookies properly
      console.log("API call succeeded, calling signIn...")
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin",
      })

      console.log("SignIn result:", result)

      if (result?.error) {
        console.error("SignIn error:", result.error)
        setError("Email ou mot de passe incorrect")
        setLoading(false)
        return
      }

      if (result?.ok) {
        console.log("Login successful, redirecting...")
        // Force full page reload
        window.location.href = "/admin"
        return
      }

      // Fallback: if signIn doesn't work but API did, try redirect anyway
      console.log("SignIn returned unexpected result, trying redirect anyway...")
      window.location.href = "/admin"
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Une erreur est survenue. Veuillez réessayer.")
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

