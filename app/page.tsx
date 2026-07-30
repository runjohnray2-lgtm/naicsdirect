"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PUBLIC_NICHES, NICHE_MAP } from "@/lib/niches"
import { cn } from "@/lib/utils"
import {
  Zap, ArrowRight, Check, Shield, Bell, BarChart3,
  Search, TrendingUp, Star, ChevronRight, Radio
} from "lucide-react"

const PRICING = [
  {
    name: "Starter",
    price: 14,
    description: "Perfect for single-industry contractors",
    features: ["1 NAICS niche", "Live SAM.gov data, synced daily", "Deadline urgency alerts", "DIBBS bid unlock"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 29,
    description: "For contractors working multiple categories",
    features: ["3 NAICS niches", "Live SAM.gov data, synced daily", "Deadline urgency alerts", "DIBBS bid unlock", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: 49,
    description: "For distributors and multi-niche resellers",
    features: ["All 8 NAICS niches", "Live SAM.gov data, synced daily", "Deadline urgency alerts", "DIBBS bid unlock", "Dedicated support"],
    cta: "Start Free Trial",
    highlighted: false,
  },
]

const COMPARE = [
  { feature: "Live SAM.gov Data", naics: true, higher: true },
  { feature: "Industry-Specific Filtering", naics: true, higher: false },
  { feature: "DIBBS Detail Unlock (Free)", naics: true, higher: false },
  { feature: "Small Business Focus", naics: true, higher: false },
  { feature: "Starting Price", naics: "$14/mo", higher: "$150/mo" },
  { feature: "No Bloat / Simple UI", naics: true, higher: false },
]

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pick your industry",
    desc: "Choose from 8 built-in niches — flooring, HVAC, janitorial, safety, and more. Each one maps to the exact NAICS codes that match what you actually sell.",
  },
  {
    step: "2",
    title: "See only your bids",
    desc: "NAICS Direct pulls live opportunities straight from SAM.gov's public API and filters out everything that isn't in your lane. No enterprise noise, no scrolling through thousands of irrelevant listings.",
  },
  {
    step: "3",
    title: "Act before the deadline",
    desc: "Color-coded urgency flags mean you find out the moment a real opportunity posts — and you know exactly what to bid.",
  },
]

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
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return "less than an hour ago"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

type NicheRequestState = "idle" | "loading" | "success" | "error"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [stats, setStats] = useState<PublicStats | null>(null)

  const [nicheRequestEmail, setNicheRequestEmail] = useState("")
  const [nicheRequestText, setNicheRequestText] = useState("")
  const [nicheRequestState, setNicheRequestState] = useState<NicheRequestState>("idle")

  useEffect(() => {
    fetch("/api/public-stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  async function handleBeta(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    try {
      await fetch("https://formsubmit.co/ajax/ray@radiantz.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          _subject: "NAICS Direct: New beta waitlist signup",
          _template: "table",
        }),
      })
    } catch {
      // Non-blocking — user already sees confirmation; a failed notification isn't their problem.
    }
  }

  async function handleNicheRequest(e: React.FormEvent) {
    e.preventDefault()
    setNicheRequestState("loading")
    try {
      const response = await fetch("https://formsubmit.co/ajax/ray@radiantz.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: nicheRequestEmail || "Not provided",
          request: nicheRequestText,
          _subject: "NAICS Direct: New niche request",
          _template: "table",
        }),
      })
      const result = await response.json()
      if (result.success === "true" || result.success === true) {
        setNicheRequestState("success")
        setNicheRequestEmail("")
        setNicheRequestText("")
      } else {
        throw new Error("failed")
      }
    } catch {
      setNicheRequestState("error")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NAICS Direct</span>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">BETA</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#live" className="text-slate-400 hover:text-white text-sm transition-colors">Live Bids</a>
            <a href="#niches" className="text-slate-400 hover:text-white text-sm transition-colors">Niches</a>
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</a>
            <Link href="/blog" className="text-slate-400 hover:text-white text-sm transition-colors">Guides</Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Live Demo</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hidden sm:flex" asChild>
              <Link href="/auth/signin">Log In</Link>
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" asChild>
              <a href="#beta">Get Beta Access</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-6 inline-flex">
            🎉 Now in Beta — Founding Member Access
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Federal Bids,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Filtered For Your Industry
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-6">
            Stop paying $500/month for bids you&apos;ll never win. NAICS Direct shows you only the federal contracts in your exact niche — real SAM.gov data, updated daily.
          </p>

          {/* Live proof, not just a claim */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 px-5 py-3 rounded-full bg-slate-900/80 border border-slate-800 text-sm">
            <span className="flex items-center gap-2 text-white font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {stats ? stats.totalActiveBids.toLocaleString() : "…"} live open opportunities
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400">across 8 industries</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400">last synced {stats ? timeAgo(stats.lastSyncedAt) : "…"}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 gap-2" asChild>
              <a href="#live">
                Browse Live Bids Free <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm font-medium underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400 transition-colors">
              View pricing
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Real SAM.gov data</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> No contract needed</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="py-16 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400">Three steps. No training, no setup calls, no bloated dashboard to learn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                    {step}
                  </div>
                  <h3 className="text-white font-semibold">{title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-12">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note — real name/identity for E-E-A-T (authenticity signal), not marketing copy */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
              RR
            </div>
            <div>
              <p className="text-slate-300 leading-relaxed">
                <span className="text-white font-semibold">Why I built this:</span> I run Radiantz LED Lighting, a small
                manufacturer and government contractor bidding on federal and state contracts through SAM.gov, DIBBS, and GSA
                Schedule. I got tired of digging through thousands of SAM.gov listings that had nothing to do with what I
                actually sell. So I built the filter I wished existed — and decided to open it up for other small contractors
                dealing with the exact same noise.
              </p>
              <p className="text-white text-sm font-semibold mt-3">Ray Runyan</p>
              <p className="text-slate-500 text-sm">Founder, NAICS Direct &middot; Owner, Radiantz LED Lighting, Inc.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free sample preview — no signup wall, proves the filtering actually works */}
      <section id="live" className="py-16 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">See Real Bids, Right Now — No Signup</h2>
            <p className="text-slate-400">A live sample straight from today&apos;s SAM.gov sync. This is exactly what you&apos;d see in your dashboard.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 min-h-[340px] sm:min-h-[300px]">
            {stats && stats.sample.length > 0 ? (
              stats.sample.map((bid, i) => {
                const niche = NICHE_MAP[bid.niche]
                return (
                  <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{bid.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{bid.agency ?? "Federal Agency"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {niche &&(
                        <Badge className={cn("text-xs border", niche.colorClass, niche.borderClass, niche.bgClass)}>
                          {niche.emoji} {niche.name}
                        </Badge>
                      )}
                      {bid.setAside && (
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">{bid.setAside}</Badge>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full min-h-[340px] sm:min-h-[300px] flex items-center justify-center p-8 text-center text-slate-500 text-sm">Loading live bids…</div>
            )}
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">
            Showing 5 of {stats ? stats.totalActiveBids.toLocaleString() : "…"} active opportunities. Sign up to filter by your exact niche and see urgency status on every bid.
          </p>
        </div>
      </section>

      <section className="py-16 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Built for Small Contractors, Not Enterprise</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Other platforms charge $150–$500/month for tools built for big defense contractors. NAICS Direct is different.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Search, title: "Your Industry Only", desc: "Choose your niche and see only bids relevant to what you actually sell. No noise, no irrelevant contracts." },
              { icon: Bell, title: "Instant Deadline Alerts", desc: "Color-coded urgency flags on your dashboard so you never miss a bid closing in the next 3–7 days." },
              { icon: BarChart3, title: "DIBBS Bid Unlock", desc: "DIBBS listings show up flagged and fuzzed out. Create a free account to reveal the solicitation number, agency, and deadline instantly." },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="bg-slate-900/60 border-slate-800">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center text-white font-semibold mb-4 text-lg">NAICS Direct vs. Other Platforms</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
              <div className="min-w-[480px]">
              <div className="grid grid-cols-3 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/60 px-4 py-3">
                <span>Feature</span>
                <span className="text-center text-indigo-400">NAICS Direct</span>
                <span className="text-center">Other Sites</span>
              </div>
              {COMPARE.map((row, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 border-t border-slate-800 text-sm">
                  <span className="text-slate-300">{row.feature}</span>
                  <span className="text-center">
                    {typeof row.naics === "boolean"
                      ? row.naics
                        ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <span className="text-slate-600">—</span>
                      : <span className="text-emerald-400 font-semibold">{row.naics}</span>}
                  </span>
                  <span className="text-center">
                    {typeof row.higher === "boolean"
                      ? row.higher
                        ? <Check className="w-4 h-4 text-slate-400 mx-auto" />
                        : <span className="text-slate-600">—</span>
                      : <span className="text-red-400 font-semibold">{row.higher}</span>}
                  </span>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="niches" className="py-16 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">8 Industry Niches</h2>
            <p className="text-slate-400">Each niche pulls live bids from SAM.gov filtered to your exact industry codes.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {PUBLIC_NICHES.map(niche => (
              <Link key={niche.id} href={`/dashboard?niche=${niche.id}`}>
                <Card className={cn(
                  "bg-slate-900 border hover:scale-[1.02] transition-all duration-200 cursor-pointer group h-full",
                  niche.borderClass
                )}>
                  <CardContent className="p-5">
                    <div className="text-3xl mb-3">{niche.emoji}</div>
                    <h3 className={cn("font-semibold text-sm mb-1.5", niche.colorClass)}>{niche.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{niche.description}</p>
                    <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity", niche.colorClass)}>
                      View bids <ChevronRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Request a niche */}
          <div className="max-w-xl mx-auto mt-12">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
              <h3 className="text-white font-semibold mb-1">Don&apos;t see your niche?</h3>
              <p className="text-slate-400 text-sm mb-4">Tell us what you sell and we&apos;ll consider adding it as a new category.</p>
              {nicheRequestState === "success" ? (
                <p className="text-emerald-400 text-sm font-medium">Thanks — we got your request and will follow up if we add it.</p>
              ) : (
                <form onSubmit={handleNicheRequest} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="your@email.com (optional)"
                    value={nicheRequestEmail}
                    onChange={e => setNicheRequestEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <Textarea
                    required
                    placeholder="What industry / NAICS codes should we add?"
                    value={nicheRequestText}
                    onChange={e => setNicheRequestText(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                    rows={3}
                  />
                  {nicheRequestState === "error" && (
                    <p className="text-red-400 text-xs">Something went wrong — email ray@radiantz.com directly.</p>
                  )}
                  <Button type="submit" disabled={nicheRequestState === "loading"} className="w-full bg-indigo-600 hover:bg-indigo-500">
                    {nicheRequestState === "loading" ? "Sending..." : "Request This Niche"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-4">Beta Pricing — Simple, Honest Rates</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Simple, Honest Pricing</h2>
            <p className="text-slate-400">3-day free trial on every plan. No annual contracts, cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING.map(plan => (
              <Card key={plan.name} className={cn(
                "relative border",
                plan.highlighted
                  ? "bg-indigo-950/60 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-900 border-slate-800"
              )}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-0 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-slate-400 text-sm">/month</span>
                    </div>
                    <p className="text-emerald-400 text-xs mt-1.5">3-day free trial &mdash; cancel anytime, no charge if you cancel first</p>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                  ))}
                  </ul>
                  <Button className={cn("w-full font-semibold", plan.highlighted ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700")}
                    variant="default"
                    asChild
                  >
                    <Link href="/pricing">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="beta" className="py-16 border-t border-slate-800/60">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Join the Beta</h2>
          <p className="text-slate-400 mb-8">Get early access and help shape the product as we grow. First 100 members only.</p>
          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-semibold">You&apos;re on the list!</p>
              <p className="text-slate-400 text-sm mt-1">We&apos;ll email you within 24 hours with access details.</p>
            </div>
          ) : (
            <form onSubmit={handleBeta} className="flex gap-3">
              <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 flex-1" required />
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 whitespace-nowrap gap-2">Get Access <ArrowRight className="w-4 h-4" /></Button>
            </form>
          )}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-600">
            <Shield className="w-3.5 h-3.5" />
            No spam. No credit card required for beta.
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-bold text-white">NAICS Direct</span>
              <span className="text-slate-400 text-sm">NAICS Direct — Federal Bid Intelligence for Small Businesses</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <a href="mailto:ray@radiantz.com" className="hover:text-slate-300 transition-colors">Contact</a>
            </div>
          </div>
          <p className="text-slate-600 text-xs">Data sourced from SAM.gov public API. All government procurement data is public domain.</p>
        </div>
      </footer>
    </div>
  )
}
