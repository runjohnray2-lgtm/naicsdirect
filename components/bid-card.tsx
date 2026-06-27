"use client"

import { Bid } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Building, ExternalLink, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { differenceInDays, parseISO } from "date-fns"

interface BidCardProps {
  bid: Bid
}

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
    textClass: "text-slate-400",
    badgeClass: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    cardBorderClass: "border-l-slate-700",
  }
  if (days < 0) return {
    label: "Closed",
    textClass: "text-slate-500",
    badgeClass: "bg-slate-500/10 border-slate-500/20 text-slate-500",
    cardBorderClass: "border-l-slate-700",
  }
  if (days <= 2) return {
    label: `${days}d left`,
    textClass: "text-red-400",
    badgeClass: "bg-red-500/10 border-red-500/30 text-red-400",
    cardBorderClass: "border-l-red-500",
  }
  if (days <= 7) return {
    label: `${days}d left`,
    textClass: "text-amber-400",
    badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    cardBorderClass: "border-l-amber-500",
  }
  return {
    label: `${days}d left`,
    textClass: "text-emerald-400",
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

export function BidCard({ bid }: BidCardProps) {
  const days = getDaysUntil(bid.responseDate)
  const urgency = urgencyConfig(days)
  const samUrl = `https://sam.gov/opp/${bid.id}/view`

  let formattedDate = "No deadline listed"
  try {
    if (bid.responseDate) {
      formattedDate = new Date(bid.responseDate).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    }
  } catch {}

  return (
    <Card
      className={cn(
        "bg-slate-900 border-slate-800 hover:border-slate-600 transition-all duration-200 group cursor-pointer border-l-4",
        urgency.cardBorderClass
      )}
      onClick={() => window.open(samUrl, "_blank")}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={cn("text-xs border px-2 py-0.5", typeConfig(bid.typeCode))}>{bid.type}</Badge>
              <Badge className={cn("text-xs border px-2 py-0.5 font-semibold", urgency.badgeClass)}>
                {days !== null && days >= 0 && days <= 2 && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                {urgency.label}
              </Badge>
            </div>
            <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">{bid.title}</h3>
            <div className="space-y-1">
              {bid.solicitationNumber && (
                <p className="text-slate-500 text-xs font-mono tracking-tight">Sol# {bid.solicitationNumber}</p>
              )}
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Building className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{bid.subAgency || bid.agency}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>Due: {formattedDate}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 flex-shrink-0 p-1.5 h-auto"
            onClick={e => { e.stopPropagation(); window.open(samUrl, "_blank") }}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
