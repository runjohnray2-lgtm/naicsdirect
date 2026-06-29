import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NICHES, NICHE_MAP } from "@/lib/niches"

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

export default async function BidsPage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const { niche: nicheParam } = await searchParams
  const activeNiche = nicheParam && NICHE_MAP[nicheParam] ? nicheParam : "flooring"

  const bids = await prisma.bid.findMany({
    where: {
      niche: activeNiche,
      active: true,
    },
    orderBy: { responseDeadline: "asc" },
    take: 50,
  })

  const totalActive = await prisma.bid.count({ where: { active: true } })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold mt-1">
              Federal Bids
              {totalActive > 0 && (
                <span className="ml-2 text-sm font-normal text-indigo-400">
                  {totalActive.toLocaleString()} active
                </span>
              )}
            </h1>
          </div>
          <Link
            href="/api/cron/sync-bids"
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            ↻ Sync Now
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Niche Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {NICHES.map((niche) => (
            <Link
              key={niche.id}
              href={`/dashboard/bids?niche=${niche.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeNiche === niche.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>{niche.emoji}</span>
              {niche.name}
            </Link>
          ))}
        </div>

        {/* Bids List */}
        {bids.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{NICHE_MAP[activeNiche]?.emoji ?? "📋"}</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              No active bids yet
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              The daily sync runs at 7 AM Pacific. You can trigger a manual sync
              to pull bids from SAM.gov right now.
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
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {bid.setAside && (
                        <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                          {bid.setAside}
                        </span>
                      )}
                      {bid.bidType && (
                        <span className="text-xs text-slate-500 uppercase tracking-wide">
                          {bid.bidType}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-slate-100 leading-snug line-clamp-2 mb-1">
                      {bid.title}
                    </h3>
                    {bid.agency && (
                      <p className="text-xs text-slate-400 truncate">{bid.agency}</p>
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
                  <p className="text-xs text-slate-600 mt-2 font-mono">
                    {bid.solicitationNumber}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
