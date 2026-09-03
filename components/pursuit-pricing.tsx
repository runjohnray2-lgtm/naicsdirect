"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calculator, Loader2, LockKeyhole, Save } from "lucide-react"

export interface PursuitEstimateView {
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

const FIELDS = [
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

export function PursuitPricing({
  pursuitId,
  estimate,
  onRefresh,
}: {
  pursuitId: string
  estimate: PursuitEstimateView | null
  onRefresh: () => Promise<void> | void
}) {
  const [form, setForm] = useState<Record<string, string>>({
    supplierCost: String(estimate?.supplierCost ?? 0),
    freightCost: String(estimate?.freightCost ?? 0),
    laborCost: String(estimate?.laborCost ?? 0),
    financingCost: String(estimate?.financingCost ?? 0),
    contingencyCost: String(estimate?.contingencyCost ?? 0),
    otherCost: String(estimate?.otherCost ?? 0),
    targetMarginPct: String(estimate?.targetMarginPct ?? 20),
    internalNotes: estimate?.internalNotes ?? "",
  })
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const totalCost = useMemo(() => FIELDS.reduce((sum, [field]) => sum + (Number(form[field]) || 0), 0), [form])
  const margin = Math.min(Math.max(Number(form.targetMarginPct) || 0, 0), 90)
  const recommended = totalCost / (1 - margin / 100)
  const grossProfit = recommended - totalCost

  async function save() {
    setWorking(true)
    setError(null)
    setSaved(false)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not save estimate")
      setSaved(true)
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save estimate")
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="bg-red-500/8 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
        <LockKeyhole className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div><p className="text-red-300 font-semibold text-sm">INTERNAL PRICING — NEVER CUSTOMER-FACING</p><p className="text-slate-400 text-xs mt-1">The customer quote builder is intentionally separated from these fields. Supplier costs, margin, financing, contingency and internal notes are not passed into outgoing quote text.</p></div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5"><Calculator className="w-5 h-5 text-amber-400" />Internal Estimate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(([field, label]) => (
            <label key={field} className="text-xs text-slate-500">{label}<Input type="number" min="0" step="0.01" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} /></label>
          ))}
          <label className="text-xs text-slate-500">Target gross margin %<Input type="number" min="0" max="90" step="0.1" className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={form.targetMarginPct} onChange={event => setForm({ ...form, targetMarginPct: event.target.value })} /></label>
          <label className="text-xs text-slate-500 sm:col-span-2">Internal notes<Textarea rows={3} className="mt-1.5 bg-slate-950 border-slate-700 text-white" value={form.internalNotes} onChange={event => setForm({ ...form, internalNotes: event.target.value })} /></label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-xs">Total cost</p><p className="text-white font-bold text-lg mt-1">{dollars(totalCost)}</p></div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-xs">Target margin</p><p className="text-white font-bold text-lg mt-1">{margin.toFixed(1)}%</p></div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3"><p className="text-slate-500 text-xs">Gross profit</p><p className="text-emerald-300 font-bold text-lg mt-1">{dollars(grossProfit)}</p></div>
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3"><p className="text-indigo-300 text-xs">Recommended price</p><p className="text-white font-bold text-lg mt-1">{dollars(recommended)}</p></div>
        </div>

        {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">{error}</div>}
        {saved && <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-300 text-sm">Internal estimate saved.</div>}
        <Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" onClick={save} disabled={working}>{working ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Internal Estimate</Button>
      </div>
    </div>
  )
}
