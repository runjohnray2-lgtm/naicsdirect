import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Public, unauthenticated endpoint used by the landing page to show real
// live numbers (total active bids + a small sample) instead of just claims.
export const revalidate = 300 // cache 5 minutes

export async function GET() {
  try {
    const [total, sample, lastSynced] = await Promise.all([
      prisma.bid.count({ where: { active: true, niche: { not: "radiantz" } } }),
      prisma.bid.findMany({
        where: { active: true, niche: { not: "radiantz" } },
        orderBy: { postedDate: "desc" },
        take: 5,
        select: {
          title: true,
          agency: true,
          niche: true,
          postedDate: true,
          responseDeadline: true,
          setAside: true,
        },
      }),
      prisma.bid.findFirst({
        where: { niche: { not: "radiantz" } },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ])

    return NextResponse.json({
      totalActiveBids: total,
      sample,
      lastSyncedAt: lastSynced?.updatedAt ?? null,
    })
  } catch (error) {
    console.error("public-stats error:", error)
    return NextResponse.json(
      { totalActiveBids: 0, sample: [], lastSyncedAt: null },
      { status: 200 }
    )
  }
}
