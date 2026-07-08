import Link from "next/link"
import { prisma } from "@/lib/db"
import { isDibbsPosting } from "@/lib/dibbs"

export const dynamic = "force-dynamic"

function DeadlineBadge({ deadline }: { deadline: Date | null }) {
  if (!deadline) return <span className="text-slate-500 text-xs">No deadline</span>

  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const formatted = deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  if (diffDays < 0) {
    return <span className="text-slate-500 text-xs line-through">{formatted}</span>
  }

  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {formatted} — {diffDays}d left
      </span>
    )
  }

  if (diffDays <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {formatted} — {diffDays}d left
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {formatted} — {diffDays}d left
    </span>
  )
}

export default async function RadiantzBidsPage() {
  const bids = await prisma.bid.findMany({
    where: { niche: "radiantz", active: true },
    orderBy: { responseDeadline: "asc" },
    take: 100,
  })

  const dibbsCount = bids.filter((b) => isDibbsPosting(b.agency, b.title)).length

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              💡 Radiantz Bid Feed
              <span className="ml-2 text-sm font-normal text-indigo-400">
                {bids.length} active{dibbsCount > 0 ? ` · ${dibbsCount} DIBBS` : ""}
              </span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Auto-synced daily from SAM.gov across all Radiantz LED Lighting NAICS codes
            </p>
          </div>
          <Link
            href="/api/cron/sync-bids"
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            ↻ Sync Now
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {bids.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💡</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">No active bids yet</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              The daily sync runs every morning. You can trigger a manual sync to pull bids
              from SAM.gov right now.
            </p>
            <Link
              href="/api/cron/sync-bids"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              ↻ Run First Sync Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => {
              const dibbs = isDibbsPosting(bid.agency, bid.title)
              return (
                <div
                  key={bid.id}
                  className={`bg-slate-900 border rounded-xl p-4 transition-colors ${
                    dibbs ? "border-orange-800/60 hover:border-orange-600" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {dibbs && (
                          <span className="text-xs bg-orange-900/50 text-orange-300 border border-orange-700 px-2 py-0.5 rounded-full font-semibold">
                            DIBBS
                          </span>
                        )}
                        {bid.setAside && (
                          <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                            {bid.setAside}
                          </span>
                        )}
                        {bid.bidType && (
                          <span className="text-xs text-slate-500 uppercase tracking-wide">{bid.bidType}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-slate-100 leading-snug line-clamp-2 mb-1">{bid.title}</h3>
                      {bid.agency && <p className="text-xs text-slate-400 truncate">{bid.agency}</p>}
                      {dibbs && (
                        <p className="text-xs text-orange-400/80 mt-1">
                          Submit via dibbs.bsm.dla.mil (requires CAGE PIN registration)
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <DeadlineBadge deadline={bid.responseDeadline} />
                      {bid.uiLink && (
                        <a
                          href={bid.uiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
                        >
                          View on SAM.gov →
                        </a>
                      )}
                    </div>
                  </div>
                  {bid.solicitationNumber && (
                    <p className="text-xs text-slate-600 mt-2 font-mono">{bid.solicitationNumber}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
