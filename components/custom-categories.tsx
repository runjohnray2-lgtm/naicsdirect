"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, SlidersHorizontal } from "lucide-react"

interface Category {
  id: string
  name: string
  keywords: string[]
  excludedKeywords: string[]
  naicsCodes: string[]
  states: string[]
  agencies: string[]
  setAsides: string[]
  active: boolean
  emailAlerts: boolean
  smsAlerts: boolean
}

function split(value: string) {
  return value.split(/[\n,]/).map(v => v.trim()).filter(Boolean)
}

export default function CustomCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    keywords: "",
    excludedKeywords: "",
    naicsCodes: "",
    states: "",
    agencies: "",
    setAsides: "",
    emailAlerts: true,
    smsAlerts: false,
  })

  async function load() {
    setLoading(true)
    const response = await fetch("/api/custom-categories", { cache: "no-store" })
    const data = await response.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [])

  async function create() {
    setWorking(true)
    setMessage(null)
    try {
      const response = await fetch("/api/custom-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          keywords: split(form.keywords),
          excludedKeywords: split(form.excludedKeywords),
          naicsCodes: split(form.naicsCodes),
          states: split(form.states),
          agencies: split(form.agencies),
          setAsides: split(form.setAsides),
          emailAlerts: form.emailAlerts,
          smsAlerts: form.smsAlerts,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not create category")
      setForm({ name: "", keywords: "", excludedKeywords: "", naicsCodes: "", states: "", agencies: "", setAsides: "", emailAlerts: true, smsAlerts: false })
      await load()
      setMessage("Personal category created.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create category")
    } finally {
      setWorking(false)
    }
  }

  async function update(category: Category, updates: Partial<Category>) {
    const next = { ...category, ...updates }
    setCategories(items => items.map(item => item.id === category.id ? next : item))
    await fetch(`/api/custom-categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
  }

  async function remove(id: string) {
    await fetch(`/api/custom-categories/${id}`, { method: "DELETE" })
    setCategories(items => items.filter(item => item.id !== id))
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><SlidersHorizontal className="w-5 h-5 text-emerald-300" /></div>
        <div><h2 className="text-white font-semibold">Personal Categories</h2><p className="text-sm text-slate-500 mt-1">Build your own bid feed using NAICS codes, keywords, location, agencies, set-asides, and exclusions. Alerts follow your exact rules.</p></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs text-slate-500">Category name<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="Oregon commercial electrical" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label className="text-xs text-slate-500">States / regions<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="OR, WA, CA" value={form.states} onChange={e => setForm({ ...form, states: e.target.value })} /></label>
        <label className="text-xs text-slate-500">NAICS codes<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="238210, 335132" value={form.naicsCodes} onChange={e => setForm({ ...form, naicsCodes: e.target.value })} /></label>
        <label className="text-xs text-slate-500">Set-asides<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="Total Small Business, WOSB" value={form.setAsides} onChange={e => setForm({ ...form, setAsides: e.target.value })} /></label>
        <label className="text-xs text-slate-500 sm:col-span-2">Agencies (optional)<Input className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="Forest Service, Army" value={form.agencies} onChange={e => setForm({ ...form, agencies: e.target.value })} /></label>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <label className="block text-xs text-slate-500">Include keywords / phrases<Textarea rows={3} className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="chiller repair, LED lighting, grounds maintenance" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} /></label>
        <label className="block text-xs text-slate-500">Exclude keywords / phrases<Textarea rows={3} className="mt-1.5 bg-slate-950 border-slate-700 text-white" placeholder="hospital, residential, overseas" value={form.excludedKeywords} onChange={e => setForm({ ...form, excludedKeywords: e.target.value })} /></label>
      </div>
      <div className="flex flex-wrap gap-5 mt-3 text-sm text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" checked={form.emailAlerts} onChange={e => setForm({ ...form, emailAlerts: e.target.checked })} />Email new matches</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.smsAlerts} onChange={e => setForm({ ...form, smsAlerts: e.target.checked })} />Text new matches</label></div>
      <div className="mt-4 flex items-center gap-3"><Button onClick={create} disabled={working || !form.name.trim()} className="bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-2" />{working ? "Creating…" : "Create Personal Category"}</Button>{message && <span className="text-xs text-slate-400">{message}</span>}</div>

      <div className="mt-6 border-t border-slate-800 pt-5">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Your categories</p>
        {loading ? <p className="text-sm text-slate-600">Loading…</p> : categories.length === 0 ? <p className="text-sm text-slate-600">No personal categories yet.</p> : <div className="space-y-3">{categories.map(category => <div key={category.id} className="border border-slate-800 rounded-xl p-4"><div className="flex items-start gap-3"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-white font-medium">{category.name}</p><span className={`text-[11px] px-2 py-0.5 rounded-full border ${category.active ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" : "text-slate-500 border-slate-700 bg-slate-800"}`}>{category.active ? "Active" : "Paused"}</span></div><p className="text-xs text-slate-500 mt-2">{category.naicsCodes.length ? `NAICS ${category.naicsCodes.join(", ")}` : "Any NAICS"}{category.states.length ? ` · ${category.states.join(", ")}` : ""}{category.setAsides.length ? ` · ${category.setAsides.join(", ")}` : ""}</p>{category.keywords.length > 0 && <p className="text-xs text-slate-500 mt-1">Include: {category.keywords.join(", ")}</p>}{category.excludedKeywords.length > 0 && <p className="text-xs text-slate-600 mt-1">Exclude: {category.excludedKeywords.join(", ")}</p>}<div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400"><label className="flex items-center gap-2"><input type="checkbox" checked={category.active} onChange={e => update(category, { active: e.target.checked })} />Active</label><label className="flex items-center gap-2"><input type="checkbox" checked={category.emailAlerts} onChange={e => update(category, { emailAlerts: e.target.checked })} />Email</label><label className="flex items-center gap-2"><input type="checkbox" checked={category.smsAlerts} onChange={e => update(category, { smsAlerts: e.target.checked })} />Text</label></div></div><button onClick={() => remove(category.id)} className="text-slate-600 hover:text-red-400" title="Delete category"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>}
      </div>
    </section>
  )
}
