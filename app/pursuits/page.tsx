"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AppNav from "@/components/app-nav"
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Loader2,
  Crosshair,
  Eye,
  AlertTriangle,
  ArrowRight,
  MapPin,
} from "lucide-react"

interface Pursuit {
  id: string
  decision: "WATCH" | "PURSUE" | "PASS"
  stage: string
  priority: string
  nextAction: string | null
  questionDeadline: string | null
  supplierQuoteDeadline: string | null
  suppliers?: Array<{ id: string }>
  estimate?: { recommendedPrice: number } | null
  quotes?: Array<{ id: string }>
  bid: {
    noticeId: string
    title: string
    solicitationNumber: string | null
    agency: string | null
    naicsCode: string | null
    responseDeadline: string | null
    uiLink: string | null
    placeCity: string | null
    placeState: string | null
  }
}

function formatDate(value: string | null) {
  if (!value) return "No deadline"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function daysUntil(value: string | null) {
  if (!value) return null
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000)
}

function urgencyClass(days: number | null) {
  if (days === null || days < 0) return "text-slate-500"
  if (days <= 2) return "text-red-400"
  if (days <= 7) return "text-amber-400"
  return "text-emerald-400"
}

function stageLabel(stage: string) {
  return stage.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
}

export default function PursuitsPage() {
  const { status } = useSession()
  const [pursuits, setPursuits] = useState<Pursuit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (status !== "authenticated") return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/pursuits", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load pursuits")
      setPursuits(data.pursuits || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pursuits")
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") load()
    if (status === "unauthenticated") setLoading(false)
  }, [status, load])

  const active = useMemo(() => pursuits.filter(item => item.decision === "PURSUE"), [pursuits])
  const watching = useMemo(() => pursuits.filter(item => item.decision === "WATCH"), [pursuits])
  const upcoming = useMemo(() => active.filter(item => item.bid.responseDeadline).sort((a, b) => new Date(a.bid.responseDeadline!).getTime() - new Date(b.bid.responseDeadline!).getTime()).slice(0, 10), [active])

  if (status === "unauthenticated") {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6"><div className="text-center max-w-md"><Crosshair className="w-10 h-10 text-indigo-400 mx-auto mb-4" /><h1 className="text-2xl font-bold text-white">Your Bid Pipeline</h1><p className="text-slate-400 mt-2 mb-6">Sign in to save and manage opportunities.</p><Button asChild className="bg-indigo-600 hover:bg-indigo-500"><Link href="/auth/signin">Sign In</Link></Button></div></div>
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7"><div><h1 className="text-3xl font-bold text-white">Government Bid Pipeline</h1><p className="text-slate-400 mt-1">Everything you decide to chase, from review through award.</p></div><div className="flex gap-2"><Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{active.length} active</Badge><Badge className="bg-slate-800 text-slate-300 border-slate-700">{watching.length} watching</Badge></div></div>

        {error && <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" />{error}</div>}

        {loading ? <div className="py-20 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />Loading pipeline…</div> : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6">
            <section>
              <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Crosshair className="w-4 h-4 text-indigo-400" />Active Pursuits</h2>
              {active.length === 0 ? <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center"><p className="text-slate-300 font-medium">No active pursuits yet.</p><p className="text-slate-500 text-sm mt-1 mb-5">Choose Pursue on a bid to create its deal room.</p><Button asChild className="bg-indigo-600 hover:bg-indigo-500"><Link href="/dashboard">Find Opportunities</Link></Button></div> : <div className="space-y-3">{active.map(item => {
                const days = daysUntil(item.bid.responseDeadline)
                const location = [item.bid.placeCity, item.bid.placeState].filter(Boolean).join(", ")
                return <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"><div className="flex flex-col lg:flex-row lg:items-center gap-4"><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2 mb-2"><Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{stageLabel(item.stage)}</Badge>{item.priority === "HIGH" && <Badge className="bg-red-500/10 text-red-300 border-red-500/30">High Priority</Badge>}{item.bid.naicsCode && <Badge className="bg-slate-800 text-slate-400 border-slate-700 font-mono">NAICS {item.bid.naicsCode}</Badge>}</div><h3 className="text-white font-semibold leading-snug">{item.bid.title}</h3><p className="text-slate-500 text-xs mt-1">{item.bid.agency || "Federal Agency"}{item.bid.solicitationNumber ? ` · ${item.bid.solicitationNumber}` : ""}</p>{location && <p className="text-slate-400 text-xs mt-2 flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-400" />{location}</p>}<div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-xs"><span className={urgencyClass(days)}>Due {formatDate(item.bid.responseDeadline)}{days !== null && days >= 0 ? ` · ${days}d` : ""}</span><span className="text-slate-400">Next: {item.nextAction || "Review pursuit"}</span></div></div><div className="flex lg:flex-col gap-2 lg:w-44"><Button asChild className="bg-indigo-600 hover:bg-indigo-500 flex-1"><Link href={`/pursuits/${item.id}`}>Open Deal Room <ArrowRight className="w-4 h-4 ml-2" /></Link></Button><Button variant="outline" className="border-slate-700 text-slate-400 flex-1" asChild><a href={item.bid.uiLink || `https://sam.gov/opp/${item.bid.noticeId}/view`} target="_blank" rel="noreferrer">SAM.gov <ExternalLink className="w-3.5 h-3.5 ml-2" /></a></Button></div></div></div>
              })}</div>}

              {watching.length > 0 && <div className="mt-8"><h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Eye className="w-4 h-4 text-slate-400" />Watching</h2><div className="space-y-2">{watching.map(item => <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex items-center gap-3"><div className="flex-1 min-w-0"><p className="text-slate-200 text-sm font-medium truncate">{item.bid.title}</p><p className="text-slate-500 text-xs mt-1">Due {formatDate(item.bid.responseDeadline)}</p></div><Button size="sm" variant="outline" className="border-slate-700 text-slate-300" asChild><Link href={`/pursuits/${item.id}`}>Review</Link></Button></div>)}</div></div>}
            </section>

            <aside><div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden sticky top-24"><div className="p-4 border-b border-slate-800"><h2 className="text-white font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-400" />Upcoming Deadlines</h2></div>{upcoming.length === 0 ? <div className="p-6 text-slate-600 text-sm text-center">No active deadlines yet.</div> : <div className="divide-y divide-slate-800">{upcoming.map(item => { const days=daysUntil(item.bid.responseDeadline); return <Link key={item.id} href={`/pursuits/${item.id}`} className="block p-4 hover:bg-slate-800/30"><p className="text-slate-200 text-xs font-medium line-clamp-2">{item.bid.title}</p><p className={`text-xs mt-2 flex items-center gap-1 ${urgencyClass(days)}`}><Clock3 className="w-3 h-3" />{formatDate(item.bid.responseDeadline)}{days !== null && days >= 0 ? ` · ${days} days` : ""}</p></Link>})}</div>}</div></aside>
          </div>
        )}
      </main>
    </div>
  )
}
