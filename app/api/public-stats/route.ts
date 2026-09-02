import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Public, unauthenticated endpoint used by the landing page.
// The free preview intentionally shows a few genuinely urgent opportunities
// while masking later opportunities so visitors can see that more inventory
// exists without giving away the paid feed.
export const revalidate = 300 // cache 5 minutes

function maskText(value: string | null) {
  if (!value) return "Federal opportunity"
  return value
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return "•".repeat(word.length)
      return `${word.slice(0, 2)}${"•".repeat(Math.min(word.length - 2, 8))}`
    })
    .join(" ")
}

export async function GET() {
  try {
    const now = new Date()
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const baseWhere = {
      active: true,
      niche: { not: "radiantz" },
      responseDeadline: { gte: now },
    } as const

    const [total, urgent, later, lastSynced] = await Promise.all([
      prisma.bid.count({ where: { active: true, niche: { not: "radiantz" } } }),
      prisma.bid.findMany({
        where: {
          ...baseWhere,
          responseDeadline: { gte: now, lte: in48Hours },
        },
        orderBy: { responseDeadline: "asc" },
        take: 4,
        select: {
          title: true,
          agency: true,
          niche: true,
          postedDate: true,
          responseDeadline: true,
          setAside: true,
        },
      }),
      prisma.bid.findMany({
        where: {
          active: true,
          niche: { not: "radiantz" },
          responseDeadline: { gt: in48Hours },
        },
        orderBy: { responseDeadline: "asc" },
        take: 6,
        select: {
          title: true,
          agency: true,
          niche: true,
          responseDeadline: true,
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
      urgentSample: urgent,
      lockedSample: later.map((bid) => ({
        title: maskText(bid.title),
        agency: maskText(bid.agency),
        niche: bid.niche,
        responseDeadline: bid.responseDeadline,
      })),
      hiddenCount: Math.max(total - urgent.length, 0),
      lastSyncedAt: lastSynced?.updatedAt ?? null,
    })
  } catch (error) {
    console.error("public-stats error:", error)
    return NextResponse.json(
      {
        totalActiveBids: 0,
        urgentSample: [],
        lockedSample: [],
        hiddenCount: 0,
        lastSyncedAt: null,
      },
      { status: 200 }
    )
  }
}
