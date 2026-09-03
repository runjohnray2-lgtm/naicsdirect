"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Loader2, ShieldCheck, Sparkles } from "lucide-react"

export interface QuoteBuilderQuote {
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

function dollars(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0)
}

export function QuoteBuilder({
  pursuitId,
  bidTitle,
  solicitationReference,
  hasEstimate,
  quotes,
  onRefresh,
}: {
  pursuitId: string
  bidTitle: string
  solicitationReference: string
  hasEstimate: boolean
  quotes: QuoteBuilderQuote[]
  onRefresh: () => Promise<void> | void
}) {
  const [form, setForm] = useState({ title: "", scopeText: "", assumptionsText: "", deliveryText: "", validityDays: "30" })
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const latest = quotes[0]

  async function build() {
    setWorking(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not build quote")
      setForm({ title: "", scopeText: "", assumptionsText: "", deliveryText: "", validityDays: "30" })
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build quote")
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div><h2 className="text-white font-semibold">Customer-Safe Quote Builder</h2><p className="text-slate-500 text-xs mt-1">The builder receives the final selling price and customer-safe bid fields only. Internal cost breakdown, margin, financing, supplier identities and internal notes remain excluded.</p></div>
        </div>
        {!hasEstimate && <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-sm">Save the internal estimate before generating a quote.</div>}
        <div className="space-y-3">
          <label className="text-xs text-slate-500">Quote title (optional)<Input className="mt-1 bg-slate-950 border-slate-700 text-white" placeholder={`Quotation — ${bidTitle}`} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
          <label className="text-xs text-slate-500">Customer-facing scope (optional)<Textarea rows={5} className="mt-1 bg-slate-950 border-slate-700 text-white" placeholder="Leave blank for a professional default." value={form.scopeText} onChange={event => setForm({ ...form, scopeText: event.target.value })} /></label>
          <label className="text-xs text-slate-500">Assumptions / clarifications (optional)<Textarea rows={4} className="mt-1 bg-slate-950 border-slate-700 text-white" value={form.assumptionsText} onChange={event => setForm({ ...form, assumptionsText: event.target.value })} /></label>
          <label className="text-xs text-slate-500">Delivery / performance statement (optional)<Textarea rows={3} className="mt-1 bg-slate-950 border-slate-700 text-white" value={form.deliveryText} onChange={event => setForm({ ...form, deliveryText: event.target.value })} /></label>
          <label className="text-xs text-slate-500">Quote validity (days)<Input type="number" min="1" max="120" className="mt-1 bg-slate-950 border-slate-700 text-white" value={form.validityDays} onChange={event => setForm({ ...form, validityDays: event.target.value })} /></label>
        </div>
        {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">{error}</div>}
        <Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" disabled={working || !hasEstimate} onClick={build}>{working ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}Build New Quote Draft</Button>
      </section>

      <section>
        {latest ? (
          <div className="bg-white text-slate-900 rounded-xl p-6 shadow-xl">
            <div className="border-b border-slate-200 pb-4 mb-5"><p className="text-indigo-700 font-bold text-xl">Radiantz</p><p className="text-slate-500 text-xs mt-1">Professional Quotation · Version {latest.version}</p></div>
            <h2 className="font-bold text-xl">{latest.title}</h2>
            <p className="text-sm text-slate-500 mt-1">Reference: {solicitationReference}</p>
            <div className="mt-5"><h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">Scope</h3><p className="whitespace-pre-wrap text-sm leading-6 mt-2">{latest.scopeText}</p></div>
            {latest.assumptionsText && <div className="mt-5"><h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">Assumptions & Clarifications</h3><p className="whitespace-pre-wrap text-sm leading-6 mt-2">{latest.assumptionsText}</p></div>}
            {latest.deliveryText && <div className="mt-5"><h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">Delivery / Performance</h3><p className="whitespace-pre-wrap text-sm leading-6 mt-2">{latest.deliveryText}</p></div>}
            <div className="mt-6 border-t border-slate-200 pt-5 flex justify-between items-end gap-4"><div><p className="text-xs text-slate-500">Valid for {latest.validityDays} days</p><p className="font-semibold mt-4">Ray Runyan</p><p className="text-sm text-slate-500">Radiantz</p></div><div className="text-right"><p className="text-xs uppercase text-slate-500">Total Quote</p><p className="text-3xl font-bold">{dollars(latest.totalPrice)}</p></div></div>
          </div>
        ) : <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center text-slate-500"><FileText className="w-8 h-8 mx-auto mb-3 text-slate-600" />Build a quote draft to preview it here.</div>}
        {quotes.length > 1 && <p className="text-slate-500 text-xs mt-3">{quotes.length} quote versions retained for this pursuit.</p>}
      </section>
    </div>
  )
}
