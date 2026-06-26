"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NICHES } from "@/lib/niches"
import { cn } from "@/lib/utils"
import {
  Zap, ArrowRight, Check, Shield, Bell, BarChart3,
  Search, TrendingUp, Star, ChevronRight
} from "lucide-react"

const PRICING = [
  {
    name: "Starter",
    price: 29,
    betaPrice: 14,
    description: "Perfect for single-industry contractors",
    features: ["1 niche category", "Live SAM.gov feed", "Deadline alerts", "Historical pricing", "Email support"],
    cta: "Start Free Trial",
    stripeUrl: "https://buy.stripe.com/6oUaEYc2X6Ni1l04cl18c00",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 59,
    betaPrice: 29,
    description: "For contractors working multiple categories",
    features: ["3 niche categories", "Live SAM.gov feed", "Deadline alerts", "Historical pricing", "Email alerts for new bids", "Priority support"],
    cta: "Start Free Trial",
    stripeUrl: "https://buy.stripe.com/28E7sM2sn5Je2p46kt18c01",
    highlighted: true,
  },
  {
    name: "Agency",
    price: 99,
    betaPrice: 49,
    description: "For distributors and multi-niche resellers",
    features: ["All 8 niches", "Live SAM.gov feed", "Deadline alerts", "Historical pricing", "Instant email alerts", "Team access", "Dedicated support"],
    cta: "Start Free Trial",
    stripeUrl: "https://buy.stripe.com/eVqcN60kf5Jee7MdMV18c02",
    highlighted: false,
  },
]

const COMPARE = [
  { feature: "Live SAM.gov Data", naics: true, higher: true },
  { feature: "Industry-Specific Filtering", naics: true, higher: false },
  { feature: "Historical Pricing", naics: true, higher: true },
  { feature: "Small Business Focus", naics: true, higher: false },
  { feature: "Starting Price", naics: "$14/mo", higher: "$150/mo" },
  { feature: "Niche Email Alerts", naics: true, higher: true },
  { feature: "No Bloat / Simple UI", naics: true, higher: false },
]

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleBeta(e: React.FormEvent) {
    e.preventDefault()
    if (email) setSubmitted(true)
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
            <a href="#niches" className="text-slate-400 hover:text-white text-sm transition-colors">Niches</a>
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</a>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Live Demo</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hidden sm:flex" asChild>
              <Link href="/dashboard">Log In</Link>
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
            🎉 Beta Access — 50% Off, Locked In Forever
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Federal Bids,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Filtered For Your Industry
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Stop paying $500/month for bids you&apos;ll never win. NAICS Direct shows you only the federal contracts in your exact niche — real SAM.gov data, updated daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 gap-2" asChild>
              <Link href="/dashboard">
                See Live Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8" asChild>
              <a href="#beta">Get Beta Access</a>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Real SAM.gov data</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> No contract needed</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
          </div>
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
              { icon: Bell, title: "Instant Deadline Alerts", desc: "Color-coded urgency flags and email alerts so you never miss a bid closing in the next 3–7 days." },
              { icon: BarChart3, title: "Historical Pricing", desc: "See what the government paid last time so you can price competitively and actually win." },
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
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
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
      </section>

      <section id="niches" className="py-16 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">8 Industry Niches</h2>
            <p className="text-slate-400">Each niche pulls live bids from SAM.gov filtered to your exact industry codes.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {NICHES.map(niche => (
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
        </div>
      </section>

      <section id="pricing" className="py-16 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-4">Beta Pricing — 50% Off</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Simple, Honest Pricing</h2>
            <p className="text-slate-400">Beta members lock in this price forever. No annual contracts, cancel anytime.</p>
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
                      <span className="text-3xl font-bold text-white">${plan.betaPrice}</span>
                      <span className="text-slate-400 text-sm">/month</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-slate-600 line-through text-sm">${plan.price}/mo</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">50% off</Badge>
                    </div>
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
                    <a href={plan.stripeUrl} target="_blank" rel="noopener noreferrer">{plan.cta}</a>
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
          <p className="text-slate-400 mb-8">Get early access, lock in 50% off forever, and help shape the product. First 100 members only.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-400 text-sm">NAICS Direct — Federal Bid Intelligence for Small Businesses</span>
          </div>
          <p className="text-slate-600 text-xs">Data sourced from SAM.gov public API. All government procurement data is public domain.</p>
        </div>
      </footer>
    </div>
  )
}
