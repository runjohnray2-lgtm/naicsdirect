"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import AppNav from "@/components/app-nav"
import { BidCard } from "@/components/bid-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bid } from "@/types"
import { Loader2, SlidersHorizontal } from "lucide-react"

interface Category {
  id: string
  name: string
  keywords: string[]
  naicsCodes: string[]
  states: string[]
  agencies: string[]
  active: boolean
  emailAlerts: boolean
  smsAlerts: boolean
}

export default function CategoriesPage() {
  const { status } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBids, setLoadingBids] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/custom-categories", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        const list = (data.categories || []).filter((c: Category) => c.active)
        setCategories(list)
        if (list[0]) setSelected(list[0].id)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [status])

  useEffect(() => {
    if (!selected) { setBids([]); return }
    setLoadingBids(true)
    setError(null)
    fetch(`/api/custom-categories/${selected}/bids`, { cache: "no-store" })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Could not load matches")
        setBids(data.bids || [])
      })
      .catch(err => setError(err instanceof Error ? err.message : "Could not load matches"))
      .finally(() => setLoadingBids(false))
  }, [selected])

  if (status === "unauthenticated") return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Button asChild><Link href="/auth/signin?callbackUrl=/categories">Sign In</Link></Button></div>

  const current = categories.find(c => c.id === selected)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div><h1 className="text-3xl font-bold">My Categories</h1><p className="text-slate-400 mt-1">Your own live government-bid feeds built around the work you actually want.</p></div>
          <Button asChild variant="outline" className="border-slate-700 text-slate-300"><Link href="/account">Manage Categories & Alerts</Link></Button>
        </div>

        {loading ? <div className="py-16 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading categories…</div> : categories.length === 0 ? (
          <div className="border border-dashed border-slate-700 rounded-2xl p-12 text-center"><SlidersHorizontal className="w-9 h-9 text-indigo-400 mx-auto mb-3" /><h2 className="text-xl font-semibold">Build your first personal category</h2><p className="text-slate-500 text-sm mt-2 mb-5">Combine NAICS codes, keywords, states, and agencies into your own feed.</p><Button asChild className="bg-indigo-600 hover:bg-indigo-500"><Link href="/account">Create Category</Link></Button></div>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <aside className="space-y-2">
              {categories.map(category => <button key={category.id} onClick={() => setSelected(category.id)} className={`w-full text-left rounded-xl border p-4 transition-colors ${selected === category.id ? "border-indigo-500/50 bg-indigo-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}><div className="flex items-center justify-between gap-2"><p className="font-medium text-white">{category.name}</p><div className="flex gap-1">{category.emailAlerts && <Badge className="text-[10px] bg-slate-800 text-slate-400 border-slate-700">Email</Badge>}{category.smsAlerts && <Badge className="text-[10px] bg-slate-800 text-slate-400 border-slate-700">Text</Badge>}</div></div><p className="text-xs text-slate-500 mt-2 line-clamp-2">{category.states.length ? category.states.join(", ") : "Any location"}{category.naicsCodes.length ? ` · NAICS ${category.naicsCodes.join(", ")}` : ""}</p></button>)}
            </aside>

            <section>
              {current && <div className="mb-5"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold">{current.name}</h2><Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">{bids.length} matches</Badge></div><p className="text-sm text-slate-500 mt-2">{current.keywords.length ? `Keywords: ${current.keywords.join(", ")}` : "No keyword restriction"}</p></div>}
              {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>}
              {loadingBids ? <div className="py-16 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Finding matches…</div> : bids.length === 0 ? <div className="border border-slate-800 bg-slate-900 rounded-xl p-10 text-center text-slate-500">No active matches right now. NAICS Direct will keep watching this category.</div> : <div className="space-y-3">{bids.map(bid => <BidCard key={bid.id} bid={bid} />)}</div>}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
