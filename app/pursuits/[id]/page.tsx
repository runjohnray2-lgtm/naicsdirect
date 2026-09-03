"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PursuitReadiness } from "@/components/pursuit-readiness"
import { SupplierManagement, SupplierManagementSupplier } from "@/components/supplier-management"
import { PursuitPricing, PursuitEstimateView } from "@/components/pursuit-pricing"
import { QuoteBuilder, QuoteBuilderQuote } from "@/components/quote-builder"
import { PursuitIntelligence } from "@/components/pursuit-intelligence"
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Zap,
} from "lucide-react"

type Tab = "overview" | "intelligence" | "suppliers" | "pricing" | "quote" | "calendar"

interface Pursuit {
  id: string
  decision: string
  stage: string
  priority: string
  notes: string | null
  nextAction: string | null
  supplierScope: string | null
  scopeReviewed: boolean
  complianceReviewed: boolean
  submissionInstructionsReviewed: boolean
  amendmentsChecked: boolean
  questionDeadline: string | null
  supplierQuoteDeadline: string | null
  bid: {
    noticeId: string
    title: string
    solicitationNumber: string | null
    agency: string | null
    naicsCode: string | null
    setAside: string | null
    responseDeadline: string | null
    uiLink: string | null
    placeStreet: string | null
    placeCity: string | null
    placeState: string | null
    placeZip: string | null
    placeCountry: string | null
  }
  suppliers: SupplierManagementSupplier[]
  estimate: PursuitEstimateView | null
  quotes: QuoteBuilderQuote[]
}

function dateInput(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function prettyDate(value: string | null) {
  if (!value) return "Not set"
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
}

export default function PursuitDealRoom() {
  const params = useParams<{ id: string }>()
  const { status } = useSession()
  const id = params.id
  const [tab, setTab] = useState<Tab>("overview")
  const [pursuit, setPursuit] = useState<Pursuit | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (status !== "authenticated" || !id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}`, { cache: "no-store" })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not load pursuit")
      setPursuit(body.pursuit)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pursuit")
    } finally {
      setLoading(false)
    }
  }, [id, status])

  useEffect(() => { load() }, [load])

  async function savePursuit(updates: Record<string, unknown>) {
    setWorking(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not save pursuit")
      setPursuit(body.pursuit)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save pursuit")
    } finally {
      setWorking(false)
    }
  }

  const location = useMemo(() => {
    if (!pursuit) return ""
    const bid = pursuit.bid
    const locality = [bid.placeCity, bid.placeState, bid.placeZip].filter(Boolean).join(", ")
    return [bid.placeStreet, locality].filter(Boolean).join(" · ")
  }, [pursuit])

  if (status === "unauthenticated") return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Button asChild><Link href="/auth/signin">Sign In</Link></Button></div>
  if (loading || !pursuit) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading deal room…</div>

  const samUrl = pursuit.bid.uiLink || `https://sam.gov/opp/${pursuit.bid.noticeId}/view`
  const solicitationReference = pursuit.bid.solicitationNumber || pursuit.bid.noticeId

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0"><Link href="/" className="flex items-center gap-2 flex-shrink-0"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div><span className="font-bold text-white hidden sm:block">NAICS Direct</span></Link><span className="text-slate-700">/</span><span className="text-slate-300 text-sm truncate">Deal Room</span></div>
          <div className="flex items-center gap-2"><Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={load}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button><Button size="sm" variant="ghost" className="text-slate-400" asChild><Link href="/pursuits"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Pursuits</Link></Button></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3"><Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{pursuit.stage.replaceAll("_", " ")}</Badge>{pursuit.bid.naicsCode && <Badge className="bg-slate-800 text-slate-300 border-slate-700 font-mono">NAICS {pursuit.bid.naicsCode}</Badge>}{pursuit.bid.setAside && <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">{pursuit.bid.setAside}</Badge>}</div>
          <h1 className="text-2xl font-bold text-white leading-tight">{pursuit.bid.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{pursuit.bid.agency || "Federal Agency"}{pursuit.bid.solicitationNumber ? ` · ${pursuit.bid.solicitationNumber}` : ""}</p>
          {location && <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-400" />{location}</p>}
        </div>

        {error && <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

        <div className="flex gap-1 overflow-x-auto border-b border-slate-800 mb-6">
          {([ ["overview","Overview"], ["intelligence","Intelligence"], ["suppliers","Suppliers"], ["pricing","Internal Pricing"], ["quote","Quote Builder"], ["calendar","Calendar"] ] as Array<[Tab,string]>).map(([value,label]) => <button key={value} onClick={() => setTab(value)} className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${tab === value ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>{label}</button>)}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-5">
            <section className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Pursuit Control</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-xs text-slate-500">Next action<Textarea rows={3} className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={pursuit.nextAction || ""} onChange={event => setPursuit({ ...pursuit, nextAction: event.target.value })} /></label><label className="text-xs text-slate-500">Internal notes<Textarea rows={3} className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={pursuit.notes || ""} onChange={event => setPursuit({ ...pursuit, notes: event.target.value })} /></label></div>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-500" disabled={working} onClick={() => savePursuit({ nextAction: pursuit.nextAction, notes: pursuit.notes })}><Save className="w-4 h-4 mr-2" />Save Pursuit</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><button onClick={() => setTab("intelligence")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/40"><p className="text-white font-medium">Research</p><p className="text-slate-500 text-xs mt-1">SAM + award history</p></button><button onClick={() => setTab("suppliers")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/40"><p className="text-white font-medium">Source</p><p className="text-slate-500 text-xs mt-1">{pursuit.suppliers.length} candidates</p></button><button onClick={() => setTab("pricing")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-500/40"><p className="text-white font-medium">Price</p><p className="text-slate-500 text-xs mt-1">{pursuit.estimate ? "Estimate saved" : "Not started"}</p></button><button onClick={() => setTab("quote")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/40"><p className="text-white font-medium">Quote</p><p className="text-slate-500 text-xs mt-1">{pursuit.quotes.length} version{pursuit.quotes.length === 1 ? "" : "s"}</p></button></div>
            </section>
            <aside className="space-y-4"><PursuitReadiness pursuitId={pursuit.id} /><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-slate-500 text-xs uppercase">Government deadline</p><p className="text-white font-semibold mt-1">{prettyDate(pursuit.bid.responseDeadline)}</p></div><Button variant="outline" className="w-full border-slate-700 text-slate-300" asChild><a href={samUrl} target="_blank" rel="noreferrer">Open Original Solicitation <ExternalLink className="w-4 h-4 ml-2" /></a></Button></aside>
          </div>
        )}

        {tab === "intelligence" && <PursuitIntelligence pursuitId={pursuit.id} />}
        {tab === "suppliers" && <SupplierManagement pursuitId={pursuit.id} suppliers={pursuit.suppliers} supplierScope={pursuit.supplierScope} locationAvailable={Boolean(pursuit.bid.placeCity && pursuit.bid.placeState)} onRefresh={load} />}
        {tab === "pricing" && <PursuitPricing pursuitId={pursuit.id} estimate={pursuit.estimate} onRefresh={load} />}
        {tab === "quote" && <QuoteBuilder pursuitId={pursuit.id} bidTitle={pursuit.bid.title} solicitationReference={solicitationReference} hasEstimate={Boolean(pursuit.estimate && pursuit.estimate.recommendedPrice > 0)} quotes={pursuit.quotes} onRefresh={load} />}

        {tab === "calendar" && (
          <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold flex items-center gap-2"><CalendarDays className="w-5 h-5 text-indigo-400" />Pursuit Deadlines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5"><label className="text-xs text-slate-500">Government response deadline<Input disabled className="mt-1.5 bg-slate-950 border-slate-800 text-slate-400" value={dateInput(pursuit.bid.responseDeadline)} /></label><label className="text-xs text-slate-500">Questions due<Input type="datetime-local" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={dateInput(pursuit.questionDeadline)} onChange={event => setPursuit({ ...pursuit, questionDeadline: event.target.value || null })} /></label><label className="text-xs text-slate-500">Supplier quotes due<Input type="datetime-local" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={dateInput(pursuit.supplierQuoteDeadline)} onChange={event => setPursuit({ ...pursuit, supplierQuoteDeadline: event.target.value || null })} /></label></div>
            <Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" disabled={working} onClick={() => savePursuit({ questionDeadline: pursuit.questionDeadline, supplierQuoteDeadline: pursuit.supplierQuoteDeadline })}><Save className="w-4 h-4 mr-2" />Save Deadlines</Button>
          </div>
        )}
      </main>
    </div>
  )
}
