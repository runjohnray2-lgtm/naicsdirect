"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"

type Tab = "overview" | "suppliers" | "pricing" | "quote" | "calendar"

interface Supplier {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  website: string | null
  distanceMiles: number | null
  status: string
}

interface Estimate {
  id: string
  supplierCost: number
  freightCost: number
  laborCost: number
  financingCost: number
  contingencyCost: number
  otherCost: number
  targetMarginPct: number
  recommendedPrice: number
  internalNotes: string | null
}

interface Quote {
  id: string
  version: number
  status: string
  title: string
  scopeText: string
  assumptionsText: string | null
  deliveryText: string | null
  validityDays: number
  totalPrice: number
  createdAt: string
}

interface Pursuit {
  id: string
  decision: string
  stage: string
  priority: string
  notes: string | null
  nextAction: string | null
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
  suppliers: Supplier[]
  estimate: Estimate | null
  quotes: Quote[]
}

const COST_FIELDS = [
  ["supplierCost", "Supplier / subcontract cost"],
  ["freightCost", "Freight / delivery"],
  ["laborCost", "Direct labor"],
  ["financingCost", "Financing / carrying cost"],
  ["contingencyCost", "Risk contingency"],
  ["otherCost", "Other direct cost"],
] as const

function dollars(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0)
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
  const [estimateForm, setEstimateForm] = useState<Record<string, string>>({})
  const [quoteForm, setQuoteForm] = useState({ title: "", scopeText: "", assumptionsText: "", deliveryText: "", validityDays: "30" })

  const load = useCallback(async () => {
    if (status !== "authenticated" || !id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}`, { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load pursuit")
      setPursuit(data.pursuit)
      const e = data.pursuit.estimate as Estimate | null
      setEstimateForm({
        supplierCost: String(e?.supplierCost ?? 0),
        freightCost: String(e?.freightCost ?? 0),
        laborCost: String(e?.laborCost ?? 0),
        financingCost: String(e?.financingCost ?? 0),
        contingencyCost: String(e?.contingencyCost ?? 0),
        otherCost: String(e?.otherCost ?? 0),
        targetMarginPct: String(e?.targetMarginPct ?? 20),
        internalNotes: e?.internalNotes ?? "",
      })
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
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save pursuit")
      setPursuit(data.pursuit)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save pursuit")
    } finally {
      setWorking(false)
    }
  }

  async function discoverSuppliers() {
    setWorking(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radiusMiles: 30 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not find nearby businesses")
      await load()
      setTab("suppliers")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find nearby businesses")
    } finally {
      setWorking(false)
    }
  }

  async function saveEstimate() {
    setWorking(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estimateForm),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save estimate")
      await load()
      setTab("pricing")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save estimate")
    } finally {
      setWorking(false)
    }
  }

  async function buildQuote() {
    setWorking(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteForm),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not build quote")
      setQuoteForm({ title: "", scopeText: "", assumptionsText: "", deliveryText: "", validityDays: "30" })
      await load()
      setTab("quote")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build quote")
    } finally {
      setWorking(false)
    }
  }

  const location = useMemo(() => {
    if (!pursuit) return ""
    const b = pursuit.bid
    return [b.placeStreet, [b.placeCity, b.placeState, b.placeZip].filter(Boolean).join(", ")].filter(Boolean).join(" · ")
  }, [pursuit])

  const totalCost = useMemo(() => COST_FIELDS.reduce((sum, [field]) => sum + (Number(estimateForm[field]) || 0), 0), [estimateForm])
  const margin = Math.min(Math.max(Number(estimateForm.targetMarginPct) || 0, 0), 90)
  const livePrice = margin >= 100 ? totalCost : totalCost / (1 - margin / 100)

  if (status === "unauthenticated") {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Button asChild><Link href="/auth/signin">Sign In</Link></Button></div>
  }

  if (loading || !pursuit) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading deal room…</div>
  }

  const samUrl = pursuit.bid.uiLink || `https://sam.gov/opp/${pursuit.bid.noticeId}/view`
  const latestQuote = pursuit.quotes[0]

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div><span className="font-bold text-white hidden sm:block">NAICS Direct</span></Link>
            <span className="text-slate-700">/</span><span className="text-slate-300 text-sm truncate">Deal Room</span>
          </div>
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
          {([ ["overview","Overview"], ["suppliers","Suppliers"], ["pricing","Internal Pricing"], ["quote","Quote Builder"], ["calendar","Calendar"] ] as Array<[Tab,string]>).map(([value,label]) => <button key={value} onClick={() => setTab(value)} className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${tab === value ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>{label}</button>)}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="lg:col-span-2 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Pursuit Control</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-xs text-slate-500">Next action<Textarea className="mt-1.5 bg-slate-950 border-slate-700 text-white" rows={3} value={pursuit.nextAction || ""} onChange={e => setPursuit({ ...pursuit, nextAction: e.target.value })} /></label>
                  <label className="text-xs text-slate-500">Internal notes<Textarea className="mt-1.5 bg-slate-950 border-slate-700 text-white" rows={3} value={pursuit.notes || ""} onChange={e => setPursuit({ ...pursuit, notes: e.target.value })} /></label>
                </div>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-500" disabled={working} onClick={() => savePursuit({ nextAction: pursuit.nextAction, notes: pursuit.notes })}><Save className="w-4 h-4 mr-2" />Save Pursuit</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => setTab("suppliers")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/40"><Building2 className="w-5 h-5 text-emerald-400 mb-3" /><p className="text-white font-medium">Source the work</p><p className="text-slate-500 text-xs mt-1">{pursuit.suppliers.length} supplier candidates saved</p></button>
                <button onClick={() => setTab("pricing")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-500/40"><Calculator className="w-5 h-5 text-amber-400 mb-3" /><p className="text-white font-medium">Build the economics</p><p className="text-slate-500 text-xs mt-1">{pursuit.estimate ? `Target ${dollars(pursuit.estimate.recommendedPrice)}` : "No estimate yet"}</p></button>
                <button onClick={() => setTab("quote")} className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/40"><FileText className="w-5 h-5 text-indigo-400 mb-3" /><p className="text-white font-medium">Build the quote</p><p className="text-slate-500 text-xs mt-1">{pursuit.quotes.length} draft version{pursuit.quotes.length === 1 ? "" : "s"}</p></button>
              </div>
            </section>
            <aside className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-slate-500 text-xs uppercase">Government deadline</p><p className="text-white font-semibold mt-1">{prettyDate(pursuit.bid.responseDeadline)}</p></div>
              <Button variant="outline" className="w-full border-slate-700 text-slate-300" asChild><a href={samUrl} target="_blank" rel="noreferrer">Open Original Solicitation <ExternalLink className="w-4 h-4 ml-2" /></a></Button>
            </aside>
          </div>
        )}

        {tab === "suppliers" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-white font-semibold">Local Suppliers & Subcontractors</h2><p className="text-slate-500 text-sm">Search around the performance location for businesses that can help fulfill the work.</p></div><Button className="bg-emerald-600 hover:bg-emerald-500" disabled={working || !pursuit.bid.placeCity || !pursuit.bid.placeState} onClick={discoverSuppliers}>{working ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}Find Nearby</Button></div>
            {!pursuit.bid.placeCity && <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-sm">This notice does not yet have a performance city/state in the local record. A SAM refresh can populate it when available.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{pursuit.suppliers.map(s => <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4"><div className="flex justify-between gap-2"><p className="text-white font-medium truncate">{s.name}</p>{s.distanceMiles !== null && <Badge className="bg-slate-800 text-slate-400 border-slate-700 whitespace-nowrap">{s.distanceMiles} mi</Badge>}</div><p className="text-slate-500 text-xs mt-1">{s.address || [s.city,s.state].filter(Boolean).join(", ")}</p><div className="flex flex-wrap gap-3 mt-3 text-xs">{s.phone && <a href={`tel:${s.phone}`} className="text-indigo-300 flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</a>}{s.email && <a href={`mailto:${s.email}`} className="text-indigo-300 flex items-center gap-1"><Mail className="w-3 h-3" />Email</a>}{s.website && <a href={s.website} target="_blank" rel="noreferrer" className="text-indigo-300 flex items-center gap-1"><Globe className="w-3 h-3" />Website</a>}</div></div>)}{pursuit.suppliers.length === 0 && <div className="md:col-span-2 lg:col-span-3 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500">No candidates saved yet.</div>}</div>
          </div>
        )}

        {tab === "pricing" && (
          <div className="max-w-4xl">
            <div className="bg-red-500/8 border border-red-500/30 rounded-xl p-4 mb-5 flex items-start gap-3"><LockKeyhole className="w-5 h-5 text-red-400 flex-shrink-0" /><div><p className="text-red-300 font-semibold text-sm">INTERNAL PRICING — NEVER CUSTOMER-FACING</p><p className="text-slate-400 text-xs mt-1">Supplier costs, margin, financing, contingency and internal notes stay behind the quote-generation security boundary.</p></div></div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{COST_FIELDS.map(([field,label]) => <label key={field} className="text-xs text-slate-500">{label}<Input type="number" min="0" step="0.01" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={estimateForm[field] || ""} onChange={e => setEstimateForm({ ...estimateForm, [field]: e.target.value })} /></label>)}<label className="text-xs text-slate-500">Target gross margin %<Input type="number" min="0" max="90" step="0.1" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={estimateForm.targetMarginPct || ""} onChange={e => setEstimateForm({ ...estimateForm, targetMarginPct: e.target.value })} /></label><label className="text-xs text-slate-500 sm:col-span-2">Internal notes<Textarea rows={3} className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={estimateForm.internalNotes || ""} onChange={e => setEstimateForm({ ...estimateForm, internalNotes: e.target.value })} /></label></div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3"><div className="bg-slate-950 rounded-lg p-3 border border-slate-800"><p className="text-slate-500 text-xs">Estimated total cost</p><p className="text-white font-bold text-lg mt-1">{dollars(totalCost)}</p></div><div className="bg-slate-950 rounded-lg p-3 border border-slate-800"><p className="text-slate-500 text-xs">Target margin</p><p className="text-white font-bold text-lg mt-1">{margin.toFixed(1)}%</p></div><div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/30"><p className="text-indigo-300 text-xs">Recommended selling price</p><p className="text-white font-bold text-lg mt-1">{dollars(livePrice)}</p></div></div>
              <Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" disabled={working} onClick={saveEstimate}>{working ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Internal Estimate</Button>
            </div>
          </div>
        )}

        {tab === "quote" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-5"><ShieldCheck className="w-5 h-5 text-emerald-400" /><div><h2 className="text-white font-semibold">Customer-Safe Quote Builder</h2><p className="text-slate-500 text-xs mt-1">This builder receives the final selling price but does not receive your internal cost breakdown, margin, supplier identities, financing or internal notes.</p></div></div>
              {!pursuit.estimate && <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-sm">Save the internal estimate first.</div>}
              <div className="space-y-3"><label className="text-xs text-slate-500">Quote title (optional)<Input className="mt-1 bg-slate-950 border-slate-700 text-white" placeholder={`Quotation — ${pursuit.bid.title}`} value={quoteForm.title} onChange={e => setQuoteForm({ ...quoteForm, title:e.target.value })} /></label><label className="text-xs text-slate-500">Customer-facing scope (optional)<Textarea rows={5} className="mt-1 bg-slate-950 border-slate-700 text-white" placeholder="Leave blank for a professional default based on the solicitation title." value={quoteForm.scopeText} onChange={e => setQuoteForm({ ...quoteForm, scopeText:e.target.value })} /></label><label className="text-xs text-slate-500">Assumptions / clarifications (optional)<Textarea rows={4} className="mt-1 bg-slate-950 border-slate-700 text-white" value={quoteForm.assumptionsText} onChange={e => setQuoteForm({ ...quoteForm, assumptionsText:e.target.value })} /></label><label className="text-xs text-slate-500">Delivery / performance statement (optional)<Textarea rows={3} className="mt-1 bg-slate-950 border-slate-700 text-white" value={quoteForm.deliveryText} onChange={e => setQuoteForm({ ...quoteForm, deliveryText:e.target.value })} /></label><label className="text-xs text-slate-500">Quote validity (days)<Input type="number" min="1" max="120" className="mt-1 bg-slate-950 border-slate-700 text-white" value={quoteForm.validityDays} onChange={e => setQuoteForm({ ...quoteForm, validityDays:e.target.value })} /></label></div>
              <Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" disabled={working || !pursuit.estimate} onClick={buildQuote}>{working ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}Build New Quote Draft</Button>
            </section>
            <section>{latestQuote ? <div className="bg-white text-slate-900 rounded-xl p-6 shadow-xl"><div className="border-b border-slate-200 pb-4 mb-5"><p className="text-indigo-700 font-bold text-xl">Radiantz</p><p className="text-slate-500 text-xs mt-1">Professional Quotation · Version {latestQuote.version}</p></div><h2 className="font-bold text-xl">{latestQuote.title}</h2><p className="text-sm text-slate-500 mt-1">Reference: {pursuit.bid.solicitationNumber || pursuit.bid.noticeId}</p><div className="mt-5"><h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">Scope</h3><p className="whitespace-pre-wrap text-sm leading-6 mt-2">{latestQuote.scopeText}</p></div>{latestQuote.assumptionsText && <div className="mt-5"><h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">Assumptions & Clarifications</h3><p className="whitespace-pre-wrap text-sm leading-6 mt-2">{latestQuote.assumptionsText}</p></div>}{latestQuote.deliveryText && <div className="mt-5"><h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">Delivery / Performance</h3><p className="whitespace-pre-wrap text-sm leading-6 mt-2">{latestQuote.deliveryText}</p></div>}<div className="mt-6 border-t border-slate-200 pt-5 flex justify-between items-end"><div><p className="text-xs text-slate-500">Valid for {latestQuote.validityDays} days</p><p className="font-semibold mt-4">Ray Runyan</p><p className="text-sm text-slate-500">Radiantz</p></div><div className="text-right"><p className="text-xs uppercase text-slate-500">Total Quote</p><p className="text-3xl font-bold text-slate-900">{dollars(latestQuote.totalPrice)}</p></div></div></div> : <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center text-slate-500"><FileText className="w-8 h-8 mx-auto mb-3 text-slate-600" />Build a quote draft to preview it here.</div>}{pursuit.quotes.length > 1 && <div className="mt-4 text-slate-500 text-xs">{pursuit.quotes.length} versions retained for this pursuit.</div>}</section>
          </div>
        )}

        {tab === "calendar" && (
          <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-5"><h2 className="text-white font-semibold flex items-center gap-2"><CalendarDays className="w-5 h-5 text-indigo-400" />Pursuit Deadlines</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5"><label className="text-xs text-slate-500">Government response deadline<Input disabled className="mt-1.5 bg-slate-950 border-slate-800 text-slate-400" value={dateInput(pursuit.bid.responseDeadline)} /></label><label className="text-xs text-slate-500">Questions due<Input type="datetime-local" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={dateInput(pursuit.questionDeadline)} onChange={e => setPursuit({ ...pursuit, questionDeadline:e.target.value || null })} /></label><label className="text-xs text-slate-500">Supplier quotes due<Input type="datetime-local" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={dateInput(pursuit.supplierQuoteDeadline)} onChange={e => setPursuit({ ...pursuit, supplierQuoteDeadline:e.target.value || null })} /></label></div><Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" disabled={working} onClick={() => savePursuit({ questionDeadline:pursuit.questionDeadline, supplierQuoteDeadline:pursuit.supplierQuoteDeadline })}><Save className="w-4 h-4 mr-2" />Save Deadlines</Button><div className="mt-5 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-400 text-sm flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />These pursuit-specific dates are now stored alongside the government deadline. Reminder delivery and external calendar synchronization are the next layer.</div></div>
        )}
      </main>
    </div>
  )
}
