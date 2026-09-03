"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  Crosshair,
  Eye,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  Phone,
  Globe,
  Building2,
} from "lucide-react"

interface SupplierCandidate {
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
  notes: string | null
}

interface PursuitBid {
  id: string
  noticeId: string
  title: string
  solicitationNumber: string | null
  agency: string | null
  naicsCode: string | null
  niche: string
  responseDeadline: string | null
  uiLink: string | null
  placeStreet: string | null
  placeCity: string | null
  placeState: string | null
  placeZip: string | null
  placeCountry: string | null
  active: boolean
}

interface Pursuit {
  id: string
  decision: "WATCH" | "PURSUE" | "PASS"
  stage: string
  priority: string
  notes: string | null
  nextAction: string | null
  questionDeadline: string | null
  supplierQuoteDeadline: string | null
  createdAt: string
  updatedAt: string
  bid: PursuitBid
  suppliers: SupplierCandidate[]
}

const STAGES = [
  ["REVIEWING", "Reviewing"],
  ["SOURCING", "Sourcing"],
  ["PRICING", "Pricing"],
  ["READY_TO_SUBMIT", "Ready to Submit"],
  ["SUBMITTED", "Submitted"],
  ["WON", "Won"],
  ["LOST", "Lost"],
] as const

function formatDate(value: string | null) {
  if (!value) return "No deadline"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function daysUntil(value: string | null) {
  if (!value) return null
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000)
}

function deadlineClass(days: number | null) {
  if (days === null) return "text-slate-400"
  if (days < 0) return "text-slate-600"
  if (days <= 2) return "text-red-400"
  if (days <= 7) return "text-amber-400"
  return "text-emerald-400"
}

function performanceLocation(bid: PursuitBid) {
  const locality = [bid.placeCity, bid.placeState, bid.placeZip].filter(Boolean).join(", ")
  return [bid.placeStreet, locality].filter(Boolean).join(" · ") || null
}

export default function PursuitsPage() {
  const { status } = useSession()
  const [pursuits, setPursuits] = useState<Pursuit[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [discoveringId, setDiscoveringId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPursuits = useCallback(async () => {
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
    if (status === "authenticated") loadPursuits()
    if (status === "unauthenticated") setLoading(false)
  }, [status, loadPursuits])

  async function updatePursuit(id: string, updates: Record<string, unknown>) {
    setSavingId(id)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not update pursuit")
      setPursuits(current => current.map(item => item.id === id ? data.pursuit : item))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update pursuit")
    } finally {
      setSavingId(null)
    }
  }

  async function discoverSuppliers(id: string) {
    setDiscoveringId(id)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${id}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radiusMiles: 30 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not find nearby suppliers")
      await loadPursuits()
      await updatePursuit(id, {
        stage: "SOURCING",
        nextAction: data.suppliers?.length
          ? `Review ${data.suppliers.length} nearby supplier/subcontractor candidates`
          : "Broaden supplier search radius or add candidates manually",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find nearby suppliers")
    } finally {
      setDiscoveringId(null)
    }
  }

  const active = useMemo(() => pursuits.filter(p => p.decision === "PURSUE"), [pursuits])
  const watching = useMemo(() => pursuits.filter(p => p.decision === "WATCH"), [pursuits])
  const upcoming = useMemo(
    () => active
      .filter(p => p.bid.responseDeadline)
      .sort((a, b) => new Date(a.bid.responseDeadline!).getTime() - new Date(b.bid.responseDeadline!).getTime())
      .slice(0, 8),
    [active]
  )

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Crosshair className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Your Bid Workspace</h1>
          <p className="text-slate-400 mb-6">Sign in to save opportunities, track deadlines, and manage the bids you decide to pursue.</p>
          <Button className="bg-indigo-600 hover:bg-indigo-500" asChild><Link href="/auth/signin">Sign In</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800/60 bg-slate-950/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
              <span className="text-base font-bold text-white hidden sm:block">NAICS Direct</span>
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300 text-sm font-medium">My Pursuits</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={loadPursuits} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-400" asChild>
              <Link href="/dashboard"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Bid Feed</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Bid Pursuit Workspace</h1>
            <p className="text-slate-400 mt-1">Move a bid from discovery into sourcing, pricing, submission, and outcome tracking.</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{active.length} pursuing</Badge>
            <Badge className="bg-slate-800 text-slate-300 border-slate-700">{watching.length} watching</Badge>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-500/10 rounded-xl p-4 text-red-300 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />Loading your pursuits…</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6">
            <section>
              <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Crosshair className="w-4 h-4 text-indigo-400" /> Active Pursuits</h2>

              {active.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
                  <Crosshair className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">No active pursuits yet.</p>
                  <p className="text-slate-500 text-sm mt-1 mb-5">When a bid looks worth chasing, click Pursue in the bid feed.</p>
                  <Button className="bg-indigo-600 hover:bg-indigo-500" asChild><Link href="/dashboard">Find a Bid</Link></Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {active.map(pursuit => {
                    const d = daysUntil(pursuit.bid.responseDeadline)
                    const samUrl = pursuit.bid.uiLink || `https://sam.gov/opp/${pursuit.bid.noticeId}/view`
                    const location = performanceLocation(pursuit.bid)
                    return (
                      <div key={pursuit.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-4 sm:p-5">
                          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">Pursuing</Badge>
                                {pursuit.priority === "HIGH" && <Badge className="bg-red-500/10 text-red-300 border-red-500/30">High priority</Badge>}
                                {pursuit.bid.naicsCode && <Badge className="bg-slate-800 text-slate-400 border-slate-700 font-mono">NAICS {pursuit.bid.naicsCode}</Badge>}
                              </div>
                              <h3 className="text-white font-semibold leading-snug">{pursuit.bid.title}</h3>
                              <p className="text-slate-500 text-xs mt-1">{pursuit.bid.agency || "Federal Agency"}{pursuit.bid.solicitationNumber ? ` · ${pursuit.bid.solicitationNumber}` : ""}</p>
                              {location && <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-indigo-400" />{location}</p>}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                                  <p className="text-slate-500 text-[11px] uppercase tracking-wide">Government deadline</p>
                                  <p className={`text-sm font-semibold mt-1 ${deadlineClass(d)}`}>{formatDate(pursuit.bid.responseDeadline)}{d !== null && d >= 0 ? ` · ${d}d left` : ""}</p>
                                </div>
                                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                                  <p className="text-slate-500 text-[11px] uppercase tracking-wide">Next action</p>
                                  <p className="text-slate-300 text-sm mt-1">{pursuit.nextAction || "Set the next action"}</p>
                                </div>
                              </div>
                            </div>

                            <div className="lg:w-48 flex-shrink-0 space-y-2">
                              <label className="text-slate-500 text-[11px] uppercase tracking-wide block">Pipeline stage</label>
                              <select
                                value={pursuit.stage}
                                onChange={event => updatePursuit(pursuit.id, { stage: event.target.value })}
                                disabled={savingId === pursuit.id}
                                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-2 text-slate-200 text-xs outline-none focus:border-indigo-500"
                              >
                                {STAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                              </select>
                              <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-300 text-xs" asChild>
                                <a href={samUrl} target="_blank" rel="noreferrer">Open Solicitation <ExternalLink className="w-3 h-3 ml-1.5" /></a>
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-800 bg-slate-950/35 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div>
                              <h4 className="text-slate-200 text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /> Local Suppliers & Subcontractors</h4>
                              <p className="text-slate-500 text-xs mt-0.5">Find nearby businesses capable of supplying or performing this category of work.</p>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-500 text-xs gap-1.5"
                              onClick={() => discoverSuppliers(pursuit.id)}
                              disabled={discoveringId === pursuit.id || !location}
                            >
                              {discoveringId === pursuit.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                              {pursuit.suppliers.length ? "Find More Nearby" : "Find Nearby"}
                            </Button>
                          </div>

                          {!location && (
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-amber-300/80 text-xs">
                              Performance location is not populated on this older bid yet. The next SAM sync will backfill it when the notice is returned by SAM.gov.
                            </div>
                          )}

                          {pursuit.suppliers.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                              {pursuit.suppliers.slice(0, 8).map(supplier => (
                                <div key={supplier.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-slate-200 text-sm font-medium truncate">{supplier.name}</p>
                                      <p className="text-slate-500 text-xs mt-0.5 truncate">{supplier.address || [supplier.city, supplier.state].filter(Boolean).join(", ") || "Local candidate"}</p>
                                    </div>
                                    {supplier.distanceMiles !== null && <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] whitespace-nowrap">{supplier.distanceMiles} mi</Badge>}
                                  </div>
                                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                                    {supplier.phone && <a className="text-indigo-300 hover:text-white flex items-center gap-1" href={`tel:${supplier.phone}`}><Phone className="w-3 h-3" />{supplier.phone}</a>}
                                    {supplier.website && <a className="text-indigo-300 hover:text-white flex items-center gap-1" href={supplier.website} target="_blank" rel="noreferrer"><Globe className="w-3 h-3" />Website</a>}
                                    {supplier.email && <a className="text-indigo-300 hover:text-white" href={`mailto:${supplier.email}`}>{supplier.email}</a>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {watching.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Eye className="w-4 h-4 text-slate-400" /> Watching</h2>
                  <div className="space-y-2">
                    {watching.map(pursuit => (
                      <div key={pursuit.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{pursuit.bid.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Due {formatDate(pursuit.bid.responseDeadline)}</p>
                        </div>
                        <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-xs" onClick={async () => {
                          const response = await fetch("/api/pursuits", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ bidId: pursuit.bid.noticeId, decision: "PURSUE" }),
                          })
                          if (response.ok) loadPursuits()
                        }}>Pursue This Bid</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden sticky top-24">
                <div className="p-4 border-b border-slate-800">
                  <h2 className="text-white font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-400" /> Bid Calendar</h2>
                  <p className="text-slate-500 text-xs mt-1">Your next government submission deadlines.</p>
                </div>
                <div className="divide-y divide-slate-800">
                  {upcoming.length === 0 ? (
                    <div className="p-6 text-center text-slate-600 text-sm">Pursued bids with deadlines will appear here.</div>
                  ) : upcoming.map(pursuit => {
                    const d = daysUntil(pursuit.bid.responseDeadline)
                    return (
                      <div key={pursuit.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-slate-500 text-[9px] uppercase">{new Date(pursuit.bid.responseDeadline!).toLocaleDateString("en-US", { month: "short" })}</span>
                            <span className="text-white font-bold text-sm leading-none">{new Date(pursuit.bid.responseDeadline!).getDate()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-200 text-xs font-medium line-clamp-2">{pursuit.bid.title}</p>
                            <p className={`text-xs mt-1 flex items-center gap-1 ${deadlineClass(d)}`}><Clock3 className="w-3 h-3" />{d !== null && d >= 0 ? `${d} days remaining` : "Deadline passed"}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 bg-slate-950/40 text-slate-500 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Supplier-quote and question deadlines are supported in the pursuit record and will be added to the combined calendar view next.
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
