"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Loader2, RefreshCw, ShieldCheck } from "lucide-react"

interface ReadinessCheck {
  id: string
  label: string
  complete: boolean
  automatic: boolean
}

interface ReadinessData {
  score: number
  completed: number
  total: number
  ready: boolean
  checks: ReadinessCheck[]
  blockers: string[]
}

const MANUAL_PATCH_FIELDS: Record<string, string> = {
  scope: "scopeReviewed",
  compliance: "complianceReviewed",
  amendments: "amendmentsChecked",
  submission: "submissionInstructionsReviewed",
}

export function PursuitReadiness({ pursuitId }: { pursuitId: string }) {
  const [data, setData] = useState<ReadinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}/readiness`, { cache: "no-store" })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not load readiness")
      setData(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load readiness")
    } finally {
      setLoading(false)
    }
  }, [pursuitId])

  useEffect(() => { load() }, [load])

  async function toggle(check: ReadinessCheck) {
    const field = MANUAL_PATCH_FIELDS[check.id]
    if (!field || check.automatic) return
    setSaving(check.id)
    setError(null)
    try {
      const response = await fetch(`/api/pursuits/${pursuitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !check.complete }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not update readiness")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update readiness")
    } finally {
      setSaving(null)
    }
  }

  if (loading && !data) return <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-sm"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Checking submission readiness…</div>

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" />Submission Readiness</h2>
          <p className="text-slate-500 text-xs mt-1">Automatic checks plus confirmations that require human review.</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${data?.ready ? "text-emerald-400" : (data?.score ?? 0) >= 70 ? "text-amber-400" : "text-slate-300"}`}>{data?.score ?? 0}%</div>
          <Badge className={data?.ready ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-slate-700"}>{data?.completed ?? 0}/{data?.total ?? 0}</Badge>
        </div>
      </div>
      {error && <div className="mx-5 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-xs">{error}</div>}
      <div className="divide-y divide-slate-800">
        {data?.checks.map(check => (
          <button
            key={check.id}
            disabled={check.automatic || saving !== null}
            onClick={() => toggle(check)}
            className={`w-full p-3.5 flex items-center gap-3 text-left ${check.automatic ? "cursor-default" : "hover:bg-slate-800/30"}`}
          >
            {saving === check.id ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : check.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-600" />}
            <span className={`text-sm flex-1 ${check.complete ? "text-slate-300" : "text-slate-500"}`}>{check.label}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-600">{check.automatic ? "Auto" : "Confirm"}</span>
          </button>
        ))}
      </div>
      <div className="p-4 bg-slate-950/40 flex items-center justify-between gap-3">
        <p className="text-slate-500 text-xs">{data?.ready ? "All tracked readiness checks are complete. Final submission still requires review against the solicitation." : `${data?.blockers.length ?? 0} item(s) remain.`}</p>
        <Button size="sm" variant="ghost" className="text-slate-500 hover:text-white" onClick={load}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
      </div>
    </div>
  )
}
