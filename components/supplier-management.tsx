"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  Copy,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react"

export interface SupplierManagementSupplier {
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
  notes?: string | null
}

interface RfqDraft {
  supplier: { id: string; name: string; email: string | null }
  subject: string
  body: string
}

const STATUSES = ["NEW", "CONTACTED", "REPLIED", "QUOTED", "SELECTED", "BACKUP", "DECLINED"]

function statusClass(status: string) {
  if (status === "SELECTED" || status === "QUOTED") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
  if (status === "REPLIED") return "bg-blue-500/10 text-blue-300 border-blue-500/30"
  if (status === "CONTACTED") return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
  if (status === "DECLINED") return "bg-red-500/10 text-red-300 border-red-500/30"
  return "bg-slate-800 text-slate-400 border-slate-700"
}

export function SupplierManagement({
  pursuitId,
  suppliers,
  supplierScope,
  locationAvailable,
  onRefresh,
}: {
  pursuitId: string
  suppliers: SupplierManagementSupplier[]
  supplierScope: string | null
  locationAvailable: boolean
  onRefresh: () => Promise<void> | void
}) {
  const [scope, setScope] = useState(supplierScope || "")
  const [working, setWorking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<RfqDraft | null>(null)
  const [copied, setCopied] = useState(false)

  async function saveScope() {
    setWorking("scope")
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierScope: scope }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not save supplier scope")
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save supplier scope")
    } finally {
      setWorking(null)
    }
  }

  async function discover() {
    setWorking("discover")
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radiusMiles: 30 }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not find nearby businesses")
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find nearby businesses")
    } finally {
      setWorking(null)
    }
  }

  async function setStatus(supplierId: string, status: string) {
    setWorking(supplierId)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not update supplier")
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update supplier")
    } finally {
      setWorking(null)
    }
  }

  async function buildRfq(supplierId: string) {
    setWorking(`rfq-${supplierId}`)
    setError(null)
    setCopied(false)
    try {
      if (scope !== (supplierScope || "")) await saveScope()
      const response = await fetch(`/api/pursuits/${pursuitId}/suppliers/${supplierId}/rfq`, { cache: "no-store" })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not build RFQ")
      setDraft(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build RFQ")
    } finally {
      setWorking(null)
    }
  }

  async function copyDraft() {
    if (!draft) return
    await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`)
    setCopied(true)
  }

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <h2 className="text-white font-semibold">Supplier-Safe Scope</h2>
            <p className="text-slate-500 text-xs mt-1">Only put information here that a supplier needs to price the work. Keep the government buyer, solicitation number, contacts, historical targets and internal strategy out.</p>
          </div>
        </div>
        <Textarea
          rows={5}
          value={scope}
          onChange={event => setScope(event.target.value)}
          placeholder="Example: Recurring commercial grounds maintenance for a small-to-medium property, including mowing, edging, trimming, weed control, debris removal and seasonal cleanup."
          className="bg-slate-950 border-slate-700 text-white"
        />
        <Button size="sm" variant="outline" className="mt-3 border-slate-700 text-slate-300" onClick={saveScope} disabled={working !== null}>
          {working === "scope" && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}Save Safe Scope
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-400" />Supplier / Subcontractor Bench</h2>
          <p className="text-slate-500 text-sm">Find local candidates, track responses, and create protected pricing requests.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={discover} disabled={working !== null || !locationAvailable}>
          {working === "discover" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}Find Nearby
        </Button>
      </div>

      {!locationAvailable && <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-sm"><MapPin className="w-4 h-4 inline mr-2" />The performance city/state is not yet available in this bid record.</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{supplier.name}</p>
                <p className="text-slate-500 text-xs mt-1 truncate">{supplier.address || [supplier.city, supplier.state].filter(Boolean).join(", ") || "Local candidate"}</p>
              </div>
              {supplier.distanceMiles !== null && <Badge className="bg-slate-800 text-slate-400 border-slate-700 whitespace-nowrap">{supplier.distanceMiles} mi</Badge>}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              {supplier.phone && <a href={`tel:${supplier.phone}`} className="text-indigo-300 flex items-center gap-1"><Phone className="w-3 h-3" />{supplier.phone}</a>}
              {supplier.email && <a href={`mailto:${supplier.email}`} className="text-indigo-300 flex items-center gap-1"><Mail className="w-3 h-3" />Email</a>}
              {supplier.website && <a href={supplier.website} target="_blank" rel="noreferrer" className="text-indigo-300 flex items-center gap-1"><Globe className="w-3 h-3" />Website</a>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                value={supplier.status}
                onChange={event => setStatus(supplier.id, event.target.value)}
                disabled={working !== null}
                className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-300 text-xs outline-none"
              >
                {STATUSES.map(status => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
              </select>
              <Badge className={`text-[10px] ${statusClass(supplier.status)}`}>{supplier.status}</Badge>
              <Button size="sm" className="h-8 ml-auto bg-indigo-600 hover:bg-indigo-500 text-xs" onClick={() => buildRfq(supplier.id)} disabled={working !== null}>
                {working === `rfq-${supplier.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}Build RFQ
              </Button>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && <div className="lg:col-span-2 border border-dashed border-slate-700 rounded-xl p-10 text-center text-slate-500">No supplier candidates saved yet.</div>}
      </div>

      {draft && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <div><p className="text-indigo-300 font-semibold text-sm">Protected RFQ — {draft.supplier.name}</p><p className="text-slate-500 text-xs mt-1">Review before sending. Government buyer and internal economics are intentionally omitted.</p></div>
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={copyDraft}><Copy className="w-3.5 h-3.5 mr-1.5" />{copied ? "Copied" : "Copy"}</Button>
          </div>
          <div className="p-5 space-y-4"><div><p className="text-slate-500 text-xs uppercase">Subject</p><p className="text-white text-sm mt-1">{draft.subject}</p></div><div><p className="text-slate-500 text-xs uppercase">Body</p><pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-4">{draft.body}</pre></div></div>
        </div>
      )}
    </div>
  )
}
