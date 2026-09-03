"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Loader2, ShieldCheck } from "lucide-react"

type FormState = {
  legalName: string
  dbaName: string
  uei: string
  cageCode: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  quoteEmail: string
  website: string
  contactName: string
  remitTo: string
}

const blank: FormState = { legalName: "", dbaName: "", uei: "", cageCode: "", address1: "", address2: "", city: "", state: "", zip: "", country: "USA", phone: "", quoteEmail: "", website: "", contactName: "", remitTo: "" }

export default function CompanyProfile() {
  const [form, setForm] = useState<FormState>(blank)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/company-profile", { cache: "no-store" }).then(r => r.json()).then(data => {
      if (data.profile) setForm({ ...blank, ...Object.fromEntries(Object.entries(data.profile).map(([k, v]) => [k, v ?? ""])) } as FormState)
    }).finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch("/api/company-profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not save company profile")
      setMessage("Federal quote profile saved.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save company profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-500 text-sm">Loading federal quote profile…</section>

  const field = (key: keyof FormState, label: string, placeholder = "") => <label className="text-xs text-slate-500">{label}<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>

  return <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <div className="flex items-start gap-3 mb-5"><div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-300" /></div><div><h2 className="text-white font-semibold">Federal Quote Profile</h2><p className="text-sm text-slate-500 mt-1">Saved once and automatically inserted into federal quote drafts. Use the exact legal business name and address associated with SAM.gov.</p></div></div>
    <div className="grid sm:grid-cols-2 gap-3">
      {field("legalName", "Legal business name *", "Exact SAM.gov legal name")}
      {field("dbaName", "DBA / trade name", "Optional")}
      {field("uei", "Unique Entity ID (UEI)", "12-character UEI")}
      {field("cageCode", "CAGE / NCAGE", "CAGE code")}
      {field("contactName", "Quote contact", "Name on outgoing quotes")}
      {field("quoteEmail", "Quote email", "quotes@company.com")}
      {field("phone", "Phone")}
      {field("website", "Website")}
      {field("address1", "Street address")}
      {field("address2", "Address line 2")}
      {field("city", "City")}
      {field("state", "State")}
      {field("zip", "ZIP / postal code")}
      {field("country", "Country")}
      <label className="text-xs text-slate-500 sm:col-span-2">Remit-to address, if different<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="Only needed when different from the business address" value={form.remitTo} onChange={e => setForm({ ...form, remitTo: e.target.value })} /></label>
    </div>
    <div className="mt-4 flex items-center gap-3"><Button onClick={save} disabled={saving || !form.legalName.trim()} className="bg-indigo-600 hover:bg-indigo-500">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}Save Federal Quote Profile</Button>{message && <span className="text-xs text-slate-400">{message}</span>}</div>
    <p className="mt-4 text-xs text-slate-600">NAICS Direct will still compare every quote against the solicitation because agencies can add or tailor submission requirements.</p>
  </section>
}
