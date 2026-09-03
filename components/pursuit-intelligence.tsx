"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  ExternalLink,
  FileSearch,
  History,
  Loader2,
  RefreshCw,
  UserRound,
} from "lucide-react"

type Award = Record<string, unknown>
type SamDetail = Record<string, unknown>

type OpportunityChange = {
  id: string
  changeType: string
  field: string
  oldValue: string | null
  newValue: string | null
  detectedAt: string
}

interface IntelligenceData {
  sam: { detail: SamDetail | null; error: string | null }
  historical: { source: string; results: Award[]; error: string | null; disclaimer: string }
}

function text(value: unknown) {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

function money(value: unknown) {
  const number = Number(value)
  if (!Number.isFinite(number)) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(number)
}

function awardValue(award: Award) {
  return award["Award Amount"] ?? award["Total Obligation"] ?? 0
}

function changeLabel(change: OpportunityChange) {
  if (change.changeType === "DEADLINE") return "Deadline changed"
  if (change.changeType === "SET_ASIDE") return "Set-aside changed"
  if (change.changeType === "LIFECYCLE") return "Notice stage changed"
  if (change.changeType === "CLASSIFICATION") return "Classification changed"
  return "Notice updated"
}

function displayChangeValue(field: string, value: string | null) {
  if (!value) return "Not listed"
  if (field === "responseDeadline") {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    }
  }
  return value
}

export function PursuitIntelligence({ pursuitId }: { pursuitId: string }) {
  const [data, setData] = useState<IntelligenceData | null>(null)
  const [changes, setChanges] = useState<OpportunityChange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [intelligenceResponse, pursuitResponse] = await Promise.all([
        fetch(`/api/pursuits/${pursuitId}/intelligence`, { cache: "no-store" }),
        fetch(`/api/pursuits/${pursuitId}`, { cache: "no-store" }),
      ])
      const [body, pursuitBody] = await Promise.all([intelligenceResponse.json(), pursuitResponse.json()])
      if (!intelligenceResponse.ok) throw new Error(body.error || "Could not load intelligence")
      setData(body)
      if (pursuitResponse.ok) setChanges(pursuitBody?.pursuit?.bid?.changes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load intelligence")
    } finally {
      setLoading(false)
    }
  }, [pursuitId])

  useEffect(() => { load() }, [load])

  if (loading && !data) return <div className="py-16 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />Researching solicitation and award history…</div>

  const detail = data?.sam.detail
  const links = Array.isArray(detail?.resourceLinks) ? detail!.resourceLinks as unknown[] : []
  const contacts = Array.isArray(detail?.pointOfContact) ? detail!.pointOfContact as Array<Record<string, unknown>> : []
  const awards = data?.historical.results ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-white font-semibold flex items-center gap-2"><FileSearch className="w-5 h-5 text-indigo-400" />Solicitation Intelligence</h2><p className="text-slate-500 text-sm mt-1">Fresh SAM.gov detail, change history, and federal award context for this pursuit.</p></div>
        <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={load} disabled={loading}>{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}Refresh Research</Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4"><h3 className="text-white font-semibold">Current SAM.gov Notice</h3><Badge className="bg-slate-800 text-slate-400 border-slate-700">Live lookup</Badge></div>
        {data?.sam.error && <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-xs">{data.sam.error}</div>}
        {detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-[10px] uppercase">Type</p><p className="text-slate-200 text-sm mt-1">{text(detail.type) || "—"}</p></div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-[10px] uppercase">Set-aside</p><p className="text-slate-200 text-sm mt-1">{text(detail.typeOfSetAsideDescription) || "Not listed"}</p></div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-[10px] uppercase">NAICS</p><p className="text-slate-200 text-sm mt-1 font-mono">{text(detail.naicsCode) || "—"}</p></div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-[10px] uppercase">PSC</p><p className="text-slate-200 text-sm mt-1 font-mono">{text(detail.classificationCode) || "—"}</p></div>
            </div>
            {text(detail.description) && <div><p className="text-slate-500 text-xs uppercase">Description / Detail Reference</p><p className="text-slate-300 text-sm leading-6 mt-2 break-words">{text(detail.description)}</p></div>}
            {links.length > 0 && <div><p className="text-slate-500 text-xs uppercase mb-2">Notice resources</p><div className="flex flex-wrap gap-2">{links.slice(0, 10).map((link, index) => typeof link === "string" ? <a key={index} href={link} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 rounded-md px-2.5 py-1.5 hover:bg-indigo-500/10">Resource {index + 1} <ExternalLink className="w-3 h-3 inline ml-1" /></a> : null)}</div></div>}
            {contacts.length > 0 && <div><p className="text-slate-500 text-xs uppercase mb-2">Government contacts</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{contacts.slice(0, 4).map((contact, index) => <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs"><p className="text-slate-300 flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5 text-indigo-400" />{text(contact.fullName) || text(contact.title) || `Contact ${index + 1}`}</p>{text(contact.email) && <p className="text-slate-500 mt-1">{text(contact.email)}</p>}{text(contact.phone) && <p className="text-slate-500 mt-1">{text(contact.phone)}</p>}</div>)}</div></div>}
          </div>
        ) : <p className="text-slate-500 text-sm">No exact SAM detail was returned.</p>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800"><h3 className="text-white font-semibold flex items-center gap-2"><History className="w-5 h-5 text-cyan-400" />What Changed</h3><p className="text-slate-500 text-xs mt-1">NAICS Direct records important SAM revisions instead of silently replacing the old value.</p></div>
        {changes.length === 0 ? <div className="p-6 text-slate-500 text-sm text-center">No tracked changes yet. Future SAM revisions will appear here automatically.</div> : <div className="divide-y divide-slate-800">{changes.map(change => <div key={change.id} className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-slate-200 text-sm font-medium">{changeLabel(change)}</p><span className="text-slate-600 text-xs">{new Date(change.detectedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span></div><div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs"><div className="rounded-md bg-slate-950 border border-slate-800 p-2"><span className="text-slate-600">Before: </span><span className="text-slate-400">{displayChangeValue(change.field, change.oldValue)}</span></div><div className="rounded-md bg-cyan-500/5 border border-cyan-500/15 p-2"><span className="text-slate-600">Now: </span><span className="text-cyan-200">{displayChangeValue(change.field, change.newValue)}</span></div></div></div>)}</div>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800"><h3 className="text-white font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-amber-400" />Recent Historical Awards</h3><p className="text-slate-500 text-xs mt-1">Context from {data?.historical.source || "USAspending.gov"}; scope matching still matters.</p></div>
        {data?.historical.error && <div className="m-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-xs">{data.historical.error}</div>}
        {awards.length > 0 ? <div className="divide-y divide-slate-800">{awards.slice(0, 10).map((award, index) => <div key={index} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_150px] gap-3"><div><p className="text-slate-200 text-sm font-medium">{text(award["Recipient Name"]) || "Recipient not listed"}</p><p className="text-slate-500 text-xs mt-1 line-clamp-2">{text(award["Description"]) || text(award["Awarding Agency"]) || "Federal award"}</p><p className="text-slate-600 text-xs mt-1">{text(award["Award ID"])}{text(award["Start Date"]) ? ` · ${text(award["Start Date"])}` : ""}</p></div><div className="md:text-right"><p className="text-emerald-300 font-semibold">{money(awardValue(award))}</p><p className="text-slate-600 text-[10px] uppercase mt-1">Historical award value</p></div></div>)}</div> : <div className="p-6 text-slate-500 text-sm text-center">No recent historical awards were returned for this NAICS lookup.</div>}
        <div className="p-4 bg-slate-950/40 text-slate-600 text-xs">{data?.historical.disclaimer}</div>
      </div>
    </div>
  )
}
