"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Global application error:", error)
    console.error("Error digest:", error.digest)
    console.error("Error stack:", error.stack)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-2xl font-bold">Erreur critique</h1>
            <p className="text-muted-foreground">
              Une erreur critique s'est produite. Veuillez rafraîchir la page.
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
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}







