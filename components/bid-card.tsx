"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Bid } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Building,
  ExternalLink,
  AlertCircle,
  Lock,
  Eye,
  Crosshair,
  XCircle,
  Loader2,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { differenceInDays, parseISO } from "date-fns"

interface BidCardProps {
  bid: Bid
  /** Used for anonymous DIBBS details. Free-preview locking is carried on bid.previewLocked. */
  locked?: boolean
}

type Decision = "WATCH" | "PURSUE" | "PASS"

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null
  try {
    return differenceInDays(parseISO(dateStr), new Date())
  } catch {
    return null
  }
}

function urgencyConfig(days: number | null) {
  if (days === null) return {
    label: "No Deadline",
    badgeClass: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    cardBorderClass: "border-l-slate-700",
  }
  if (days < 0) return {
    label: "Closed",
    badgeClass: "bg-slate-500/10 border-slate-500/20 text-slate-500",
    cardBorderClass: "border-l-slate-700",
  }
  if (days <= 2) return {
    label: `${days}d left`,
    badgeClass: "bg-red-500/10 border-red-500/30 text-red-400",
    cardBorderClass: "border-l-red-500",
  }
  if (days <= 7) return {
    label: `${days}d left`,
    badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    cardBorderClass: "border-l-amber-500",
  }
  return {
    label: `${days}d left`,
    badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    cardBorderClass: "border-l-emerald-500",
  }
}

function typeConfig(code: string) {
  const map: Record<string, string> = {
    o: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    k: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    p: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    s: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    r: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    i: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  }
  return map[code] || "bg-slate-500/20 text-slate-300 border-slate-500/30"
}

export function BidCard({ bid, locked = false }: BidCardProps) {
  const { status } = useSession()
  const [savingDecision, setSavingDecision] = useState<Decision | null>(null)
  const [savedDecision, setSavedDecision] = useState<Decision | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const days = getDaysUntil(bid.responseDate)
  const urgency = urgencyConfig(days)
  const samUrl = `https://sam.gov/opp/${bid.id}/view`
  const isLockedDibbs = locked && bid.isDibbs

  let formattedDate = "No deadline listed"
  try {
    if (bid.responseDate) {
      formattedDate = new Date(bid.responseDate).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    }
  } catch {}

  if (bid.previewLocked) {
    return (
      <Card className="relative overflow-hidden bg-slate-900 border-slate-800 border-l-4 border-l-slate-700">
        <CardContent className="relative p-4 min-h-[178px]">
          <div aria-hidden="true" className="space-y-3 opacity-45 select-none pointer-events-none">
            <div className="flex gap-2">
              <div className="h-5 w-24 rounded-full bg-slate-700" />
              <div className="h-5 w-20 rounded-full bg-slate-700" />
            </div>
            <div className="h-4 w-4/5 rounded bg-slate-700" />
            <div className="h-4 w-2/3 rounded bg-slate-800" />
            <div className="space-y-2 pt-1">
              <div className="h-3 w-36 rounded bg-slate-800" />
              <div className="h-3 w-52 rounded bg-slate-800" />
              <div className="h-3 w-44 rounded bg-slate-800" />
            </div>
          </div>

          <div className="absolute inset-0 bg-slate-950/72 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-white text-sm font-semibold">More live opportunities are available</p>
              <p className="text-slate-400 text-xs mt-1">
                {days !== null && days >= 0 ? `Another opportunity closes in about ${days} day${days === 1 ? "" : "s"}. ` : ""}
                Subscribe to reveal the agency, solicitation, scope, and pursuit tools.
              </p>
              <Button size="sm" className="mt-3 h-8 bg-indigo-600 hover:bg-indigo-500" asChild>
                <Link href="/pricing">Unlock Full Bid Feed</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  async function saveDecision(decision: Decision) {
    setSaveError(null)
    setSavingDecision(decision)
    try {
      const response = await fetch("/api/pursuits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId: bid.id, decision }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save this bid")
      setSavedDecision(decision)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save this bid")
    } finally {
      setSavingDecision(null)
    }
  }

  return (
    <Card
      className={cn(
        "bg-slate-900 border-slate-800 transition-all duration-200 border-l-4",
        urgency.cardBorderClass,
        !isLockedDibbs && "hover:border-slate-600 group"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={cn("text-xs border px-2 py-0.5", typeConfig(bid.typeCode))}>{bid.type}</Badge>
              {bid.isDibbs && (
                <Badge className="text-xs border px-2 py-0.5 font-semibold bg-orange-500/20 text-orange-300 border-orange-500/30">DIBBS</Badge>
              )}
              <Badge className={cn("text-xs border px-2 py-0.5 font-semibold", urgency.badgeClass)}>
                {days !== null && days >= 0 && days <= 2 && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                {isLockedDibbs ? "Urgency locked" : urgency.label}
              </Badge>
              {savedDecision && (
                <Badge className="text-xs border px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                  <Check className="w-3 h-3 mr-1" /> {savedDecision === "PURSUE" ? "Pursuing" : savedDecision === "WATCH" ? "Watching" : "Passed"}
                </Badge>
              )}
            </div>

            <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2">{bid.title}</h3>

            {isLockedDibbs ? (
              <div className="space-y-1.5">
                <p className="text-slate-600 text-xs font-mono blur-[3px] select-none">Sol# ████-██-█-████</p>
                <div className="flex items-center gap-1.5 text-slate-600 text-xs blur-[3px] select-none"><Building className="w-3 h-3 flex-shrink-0" /><span>██████ ███████ █████</span></div>
                <div className="flex items-center gap-1.5 text-slate-600 text-xs blur-[3px] select-none"><Calendar className="w-3 h-3 flex-shrink-0" /><span>Due: ██████ ██, ████</span></div>
              </div>
            ) : (
              <div className="space-y-1">
                {bid.solicitationNumber && <p className="text-slate-500 text-xs font-mono tracking-tight">Sol# {bid.solicitationNumber}</p>}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Building className="w-3 h-3 flex-shrink-0" /><span className="truncate">{bid.subAgency || bid.agency}</span></div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Calendar className="w-3 h-3 flex-shrink-0" /><span>Due: {formattedDate}</span></div>
              </div>
            )}

            {isLockedDibbs ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Button size="sm" className="h-7 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 gap-1.5" asChild>
                  <Link href="/auth/signin"><Lock className="w-3 h-3" /> Unlock DIBBS Details — Free</Link>
                </Button>
              </div>
            ) : (
              <>
                {bid.isDibbs && (
                  <p className="text-orange-400/80 text-xs mt-1.5">
                    Submit via dibbs.bsm.dla.mil (requires{" "}
                    <a href="https://www.dibbs.bsm.dla.mil/Registration/" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-300">free CAGE PIN registration</a>)
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  {status === "authenticated" ? (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5" disabled={savingDecision !== null} onClick={() => saveDecision("WATCH")}>
                        {savingDecision === "WATCH" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Watch
                      </Button>
                      <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5" disabled={savingDecision !== null} onClick={() => saveDecision("PURSUE")}>
                        {savingDecision === "PURSUE" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />} Pursue
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 gap-1.5" disabled={savingDecision !== null} onClick={() => saveDecision("PASS")}>
                        {savingDecision === "PASS" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Pass
                      </Button>
                      {savedDecision === "PURSUE" && <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-300 hover:text-white" asChild><Link href="/pursuits">Open workspace →</Link></Button>}
                    </>
                  ) : (
                    <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500" asChild><Link href="/auth/signin">Sign in to Watch or Pursue</Link></Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:text-indigo-300 ml-auto gap-1.5" onClick={() => window.open(samUrl, "_blank")}>
                    SAM.gov <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
                {saveError && <p className="text-red-400 text-xs mt-2">{saveError}</p>}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
