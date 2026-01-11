import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function ThemeDebugPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <h1 className="text-4xl font-bold mb-8 tracking-tight">Theme Debug Page</h1>
          
          <div className="space-y-12">
            {/* Primary Colors */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Primary Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary p-8 rounded-xl shadow-md">
                  <p className="text-primary-foreground font-bold text-lg mb-2">bg-primary</p>
                  <p className="text-primary-foreground/80 text-sm">text-primary-foreground</p>
                  <p className="text-primary-foreground/60 text-xs mt-4">
                    CSS Variable: var(--color-primary)
                  </p>
                </div>
                <div className="border-2 border-primary p-8 rounded-xl">
                  <p className="text-primary font-bold text-lg mb-2">border-primary</p>
                  <p className="text-foreground">text-foreground</p>
                  <p className="text-muted-foreground text-xs mt-4">
                    Border uses primary color
                  </p>
                </div>
              </div>
            </section>

            {/* Background Colors */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Background Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
                  <p className="text-foreground font-bold mb-2">bg-background</p>
                  <p className="text-foreground/80">text-foreground</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                  <p className="text-card-foreground font-bold mb-2">bg-card</p>
                  <p className="text-card-foreground/80">text-card-foreground</p>
                </div>
                <div className="bg-muted border border-border p-6 rounded-xl shadow-sm">
                  <p className="text-muted-foreground font-bold mb-2">bg-muted</p>
                  <p className="text-muted-foreground/80">text-muted-foreground</p>
                </div>
              </div>
            </section>

            {/* Buttons */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default (Primary)</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Badges</h2>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </section>

            {/* Inputs */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Inputs</h2>
              <div className="max-w-md space-y-4">
                <Input type="text" placeholder="Default input" />
                <Input type="email" placeholder="Email input" />
                <Input type="password" placeholder="Password input" />
              </div>
            </section>

            {/* Cards */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
                  <p className="text-muted-foreground">
                    This is a card with bg-card and border-border
                  </p>
                </div>
                <div className="bg-muted border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Muted Card</h3>
                  <p className="text-muted-foreground">
                    This card uses bg-muted for subtle background
                  </p>
                </div>
              </div>
            </section>

            {/* Links */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Links</h2>
              <div className="space-y-2">
                <a href="#" className="text-primary hover:underline font-medium">
                  Primary link (text-primary)
                </a>
                <br />
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Foreground link (hover:primary)
                </a>
                <br />
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Muted link (hover:foreground)
                </a>
              </div>
            </section>

            {/* Focus States */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Focus States</h2>
              <div className="space-y-4 max-w-md">
                <Input
                  type="text"
                  placeholder="Focus me to see ring-primary"
                  className="focus-visible:ring-ring"
                />
                <Button variant="outline" className="focus-visible:ring-ring">
                  Button with focus ring
                </Button>
              </div>
            </section>

            {/* CSS Variables Reference */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">CSS Variables Reference</h2>
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                  <div>
                    <p className="font-bold mb-2">Primary:</p>
                    <p className="text-muted-foreground">--color-primary: oklch(0.52 0.16 150)</p>
                    <p className="text-muted-foreground">--primary: var(--color-primary)</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Background:</p>
                    <p className="text-muted-foreground">--color-background: oklch(0.99 0.002 106)</p>
                    <p className="text-muted-foreground">--background: var(--color-background)</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Card:</p>
                    <p className="text-muted-foreground">--color-card: oklch(1 0 0)</p>
                    <p className="text-muted-foreground">--card: var(--color-card)</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Border:</p>
                    <p className="text-muted-foreground">--color-border: oklch(0.92 0.002 106)</p>
                    <p className="text-muted-foreground">--border: var(--color-border)</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Ring:</p>
                    <p className="text-muted-foreground">--color-ring: oklch(0.52 0.16 150)</p>
                    <p className="text-muted-foreground">--ring: var(--color-ring)</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Radius:</p>
                    <p className="text-muted-foreground">--radius: 0.5rem</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}



