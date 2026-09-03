"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Crosshair, LayoutDashboard, UserRound, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Bid Feed", icon: LayoutDashboard },
  { href: "/pursuits", label: "My Pursuits", icon: Crosshair },
  { href: "/pricing", label: "Plans", icon: CreditCard },
  { href: "/account", label: "Account", icon: UserRound },
]

export default function AppNav() {
  const pathname = usePathname()
  const { status } = useSession()

  return (
    <header className="border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">N</div>
          <span className="font-bold text-white hidden sm:block">NAICS Direct</span>
        </Link>

        <nav className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {links.map(({ href, label, icon: Icon }) => {
            if (status !== "authenticated" && (href === "/pursuits" || href === "/account")) return null
            const active = pathname === href || (href === "/pursuits" && pathname.startsWith("/pursuits/"))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {status === "unauthenticated" && (
          <Link href="/auth/signin" className="text-sm text-slate-300 hover:text-white flex-shrink-0">Sign In</Link>
        )}
      </div>
    </header>
  )
}
