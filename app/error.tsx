"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Application error:", error)
    console.error("Error digest:", error.digest)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
        <p className="text-muted-foreground">
          Désolé, une erreur inattendue s'est produite. Veuillez réessayer.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive">
              {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Réessayer</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}





