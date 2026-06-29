"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BidCard } from "@/components/bid-card"
import { NICHES } from "@/lib/niches"
import { Bid } from "@/types"
import { cn } from "@/lib/utils"
import { Zap, RefreshCw, AlertCircle, BarChart3, ChevronLeft, X } from "lucide-react"

type Bucket = "urgent" | "soon" | "open" | null

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialNiche = searchParams.get("niche") || NICHES[0].id

  const [activeNiche, setActiveNiche] = useState(initialNiche)
  const [bids, setBids] = useState<Bid[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [filterBucket, setFilterBucket] = useState<Bucket>(null)

  const fetchBids = useCallback(async (nicheId: string) => {
    setLoading(true)
    setError(null)
    setFilterBucket(null)
    try {
      const res = await fetch(`/api/bids?niche=${nicheId}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBids(data.bids || [])
      setTotal(data.total || 0)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bids")
      setBids([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBids(activeNiche)
  }, [activeNiche, fetchBids])

  const currentNiche = NICHES.find(n => n.id === activeNiche) || NICHES[0]

  // Categorize bids by urgency (days until deadline)
  const getDays = (b: Bid) =>
    b.responseDate
      ? Math.ceil((new Date(b.responseDate).getTime() - Date.now()) / 86400000)
      : Infinity

  const urgentBids = bids.filter(b => { const d = getDays(b); return d >= 0 && d <= 2 })
  const soonBids   = bids.filter(b => { const d = getDays(b); return d > 2 && d <= 7 })
  const openBids   = bids.filter(b => { const d = getDays(b); return d > 7 })
  const openCount  = urgentBids.length + soonBids.length + openBids.length

  // Filter displayed bids by selected bucket
  const displayBids =
    filterBucket === "urgent" ? urgentBids :
    filterBucket === "soon"   ? soonBids :
    filterBucket === "open"   ? openBids :
    bids

  const toggleBucket = (bucket: Bucket) =>
    setFilterBucket(prev => prev === bucket ? null : bucket)

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white hidden sm:block">NAICS Direct</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="text-slate-400 text-sm hidden sm:block truncate">Live Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-slate-600 text-xs hidden md:block">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
              onClick={() => fetchBids(activeNiche)}
              disabled={loading}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs hidden sm:flex">
              BETA
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="w-56 flex-shrink-0 border-r border-slate-800/60 hidden lg:block">
          <div className="sticky top-16 p-3 space-y-1">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 py-2">
              Industries
            </p>
            {NICHES.map(niche => (
              <button
                key={niche.id}
                onClick={() => setActiveNiche(niche.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                  activeNiche === niche.id
                    ? `${niche.bgClass} ${niche.colorClass} border ${niche.borderClass}`
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <span className="text-base">{niche.emoji}</span>
                <span className="font-medium truncate">{niche.name}</span>
              </button>
            ))}
            <div className="pt-4 px-2">
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-3">
                <p className="text-indigo-400 text-xs font-semibold mb-1">Beta Access</p>
                <p className="text-slate-500 text-xs">All 8 niches unlocked during beta period.</p>
                <Link href="/#pricing" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block underline underline-offset-2">
                  View pricing &#x2192;
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {/* Mobile niche tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden scrollbar-hide">
            {NICHES.map(niche => (
              <button
                key={niche.id}
                onClick={() => setActiveNiche(niche.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                  activeNiche === niche.id
                    ? `${niche.bgClass} ${niche.colorClass} ${niche.borderClass}`
                    : "text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                )}
              >
                <span>{niche.emoji}</span>
                <span>{niche.name}</span>
              </button>
            ))}
          </div>

          {/* Niche header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{currentNiche.emoji}</span>
                {currentNiche.name}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{currentNiche.description}</p>
            </div>
            {!loading && !error && openCount > 0 && (
              <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                {openCount} active bids
              </Badge>
            )}
          </div>

          {/* Urgency buckets — clickable to filter the list below */}
          {!loading && !error && bids.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => toggleBucket("urgent")}
                title="Click to filter by closing soon"
                className={cn(
                  "rounded-xl p-3 text-center border transition-all",
                  filterBucket === "urgent"
                    ? "bg-red-500/25 border-red-500/60 ring-2 ring-red-500/30"
                    : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                )}
              >
                <div className="text-2xl font-bold text-red-400">{urgentBids.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Closing &#x2264;2 days</div>
              </button>
              <button
                onClick={() => toggleBucket("soon")}
                title="Click to filter by closing this week"
                className={cn(
                  "rounded-xl p-3 text-center border transition-all",
                  filterBucket === "soon"
                    ? "bg-amber-500/25 border-amber-500/60 ring-2 ring-amber-500/30"
                    : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                )}
              >
                <div className="text-2xl font-bold text-amber-400">{soonBids.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Closing 3&#x2013;7 days</div>
              </button>
              <button
                onClick={() => toggleBucket("open")}
                title="Click to filter by open bids"
                className={cn(
                  "rounded-xl p-3 text-center border transition-all",
                  filterBucket === "open"
                    ? "bg-emerald-500/25 border-emerald-500/60 ring-2 ring-emerald-500/30"
                    : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                )}
              >
                <div className="text-2xl font-bold text-emerald-400">{openBids.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Open &gt;7 days</div>
              </button>
            </div>
          )}

          {/* Active filter indicator */}
          {filterBucket && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-slate-400 text-xs">
                Filtering:{" "}
                <span className={cn(
                  "font-medium",
                  filterBucket === "urgent" ? "text-red-400" :
                  filterBucket === "soon"   ? "text-amber-400" : "text-emerald-400"
                )}>
                  {filterBucket === "urgent" ? "Closing ≤2 days" :
                   filterBucket === "soon"   ? "Closing 3–7 days" : "Open >7 days"}
                </span>
              </span>
              <button
                onClick={() => setFilterBucket(null)}
                className="text-slate-600 hover:text-white transition-colors"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* NAICS codes */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {currentNiche.naicsCodes.map(code => (
              <Badge key={code} className="bg-slate-800/60 text-slate-400 border-slate-700 text-xs font-mono">
                {code}
              </Badge>
            ))}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-slate-800" />
                      <Skeleton className="h-3 w-1/2 bg-slate-800" />
                    </div>
                    <Skeleton className="h-6 w-20 bg-slate-800 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-24 bg-slate-800 rounded-full" />
                    <Skeleton className="h-5 w-28 bg-slate-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-1">Failed to load bids</p>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => fetchBids(activeNiche)}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* EMPTY — no bids at all */}
          {!loading && !error && bids.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium mb-1">No active bids found</p>
              <p className="text-slate-500 text-sm">SAM.gov returned no open solicitations for this niche right now. Check back soon.</p>
            </div>
          )}

          {/* EMPTY BUCKET — filtered to zero */}
          {!loading && !error && bids.length > 0 && displayBids.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium mb-1">No bids in this window</p>
              <p className="text-slate-500 text-sm mb-4">Try a different time bucket or view all bids.</p>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setFilterBucket(null)}
              >
                Show all bids
              </Button>
            </div>
          )}

          {/* BID LIST */}
          {!loading && !error && displayBids.length > 0 && (
            <div className="space-y-3">
              {displayBids.map(bid => (
                <BidCard key={bid.id} bid={bid} />
              ))}
              <div className="text-center pt-4">
                <p className="text-slate-600 text-xs">
                  Showing {displayBids.length} of {openCount} active bids
                  {filterBucket ? " (filtered)" : ""}
                </p>
                <p className="text-slate-700 text-xs mt-1">
                  Data sourced from SAM.gov · synced daily at 7 AM Pacific.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
