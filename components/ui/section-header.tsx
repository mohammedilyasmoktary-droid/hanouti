import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">{title}</h2>
        {subtitle && (
          <p className="text-sm text-zinc-600">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link href={action.href}>
          <Button variant="ghost" size="sm" className="gap-2 text-sm">
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}


