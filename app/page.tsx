"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Bell, Check, FileText, Radio, Search, ShieldCheck, ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PUBLIC_NICHES, NICHE_MAP } from "@/lib/niches"
import { PLANS } from "@/lib/plans"
import { cn } from "@/lib/utils"

interface SampleBid {
  title: string
  agency: string | null
  niche: string
  postedDate: string | null
  responseDeadline: string | null
  setAside: string | null
}

interface PublicStats {
  totalActiveBids: number
  sample: SampleBid[]
  lastSyncedAt: string | null
}

function timeAgo(iso: string | null) {
  if (!iso) return "recently"
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return "less than an hour ago"
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const WORKFLOW = [
  {
    icon: Search,
    title: "Find the right bid",
    desc: "Filter real SAM.gov opportunities by the work and products you actually pursue instead of digging through thousands of irrelevant notices.",
  },
  {
    icon: Bell,
    title: "Know what changed",
    desc: "Track deadlines, amendments, pursuit status, and urgency so an opportunity does not quietly die while you are waiting on suppliers or subcontractors.",
  },
  {
    icon: ShoppingCart,
    title: "Source the job",
    desc: "Move promising opportunities into a pursuit workspace, research suppliers and subcontractors, and keep pricing work tied to the actual bid.",
  },
  {
    icon: FileText,
    title: "Build the quote",
    desc: "Use your federal contractor profile, internal pricing, historical award context, and customer-safe quote tools to move toward submission.",
  },
]

export default function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null)

  useEffect(() => {
    fetch("/api/public-stats")
      .then((response) => response.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600"><Zap className="h-4 w-4" /></span>
            <span className="font-bold">NAICS Direct</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#workflow" className="hover:text-white">How it works</a>
            <a href="#live" className="hover:text-white">Live bids</a>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/blog" className="hover:text-white">Guides</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link href="/auth/signin">Log in</Link></Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" asChild><Link href="/pricing">Start 7-Day Trial</Link></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-800/60">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-28">
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Find the bid. Source the job. Build the quote. <span className="text-indigo-400">Do not miss the deadline.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400 sm:text-xl">
              NAICS Direct gives small contractors one practical workflow for finding relevant federal opportunities, tracking pursuits, researching prior awards, sourcing suppliers and subcontractors, and preparing quotes.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="bg-indigo-600 px-8 hover:bg-indigo-500" asChild>
                <Link href="/pricing">Start 7-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800" asChild>
                <Link href="/dashboard">See the Product</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> 7 days free</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Cancel anytime</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Real SAM.gov data</span>
            </div>

            <div className="mx-auto mt-10 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-slate-800 bg-slate-900/80 px-5 py-3 text-sm">
              <span className="flex items-center gap-2 font-semibold"><Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />{stats ? stats.totalActiveBids.toLocaleString() : "…"} open opportunities</span>
              <span className="text-slate-500">{PUBLIC_NICHES.length} built-in categories + custom categories</span>
              <span className="text-slate-500">synced {stats ? timeAgo(stats.lastSyncedAt) : "…"}</span>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Built around the work between finding a bid and submitting it</h2>
            <p className="mt-4 text-slate-400">The value is not another giant bid list. It is having enough time and context to decide, source, price, and act.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-slate-800 bg-slate-900/70">
                <CardContent className="p-6">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15"><Icon className="h-5 w-5 text-indigo-400" /></span>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="live" className="border-y border-slate-800/60 bg-slate-900/30 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold">See real federal opportunities before you sign up</h2>
              <p className="mt-3 text-slate-400">Live sample from the current SAM.gov sync.</p>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
              {stats?.sample?.length ? stats.sample.map((bid, index) => {
                const niche = NICHE_MAP[bid.niche]
                return (
                  <div key={`${bid.title}-${index}`} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{bid.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{bid.agency ?? "Federal Agency"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {niche && <Badge className={cn("border text-xs", niche.colorClass, niche.borderClass, niche.bgClass)}>{niche.emoji} {niche.name}</Badge>}
                      {bid.setAside && <Badge className="border-slate-700 bg-slate-800 text-xs text-slate-300">{bid.setAside}</Badge>}
                    </div>
                  </div>
                )
              }) : <div className="p-10 text-center text-sm text-slate-500">Loading live opportunities…</div>}
            </div>
            <div className="mt-6 text-center"><Button variant="outline" className="border-slate-700 bg-slate-900 hover:bg-slate-800" asChild><Link href="/dashboard">Browse the live feed</Link></Button></div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Simple monthly pricing</h2>
            <p className="mt-3 text-slate-400">Every plan starts with a 7-day free trial. No annual contract.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Card key={plan.id} className={cn("border bg-slate-900", "popular" in plan && plan.popular ? "border-indigo-500" : "border-slate-800")}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mt-1 min-h-10 text-sm text-slate-400">{plan.description}</p>
                  <p className="mt-5"><span className="text-3xl font-bold">${plan.price}</span><span className="text-slate-500">/month</span></p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-300">
                    {plan.features.slice(0, 4).map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{feature}</li>)}
                  </ul>
                  <Button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500" asChild><Link href="/pricing">Start 7-Day Trial</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-800/60 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <ShieldCheck className="mx-auto h-9 w-9 text-indigo-400" />
            <h2 className="mt-4 text-2xl font-bold">Built for small businesses doing real government-contracting work</h2>
            <p className="mt-3 leading-7 text-slate-400">NAICS Direct helps organize the pursuit. The solicitation itself remains authoritative, and complete bid review still requires reading the full notice, links, attachments, amendments, clauses, and submission instructions.</p>
            <Button size="lg" className="mt-7 bg-indigo-600 hover:bg-indigo-500" asChild><Link href="/pricing">Try NAICS Direct for 7 Days</Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-indigo-400" /><span>NAICS Direct</span></div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
