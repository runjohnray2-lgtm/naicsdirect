import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Public, unauthenticated endpoint used by the landing page.
// Show a couple of genuinely urgent opportunities in full, then return
// intentionally locked placeholders for additional inventory. Do not scramble
// real titles/agencies: the UI renders clean skeleton rows instead.
export const revalidate = 300 // cache 5 minutes

function hoursUntil(date: Date | null) {
  if (!date) return null
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / (60 * 60 * 1000)))
}

export async function GET() {
  try {
    const now = new Date()
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const [total, urgent, later, lastSynced] = await Promise.all([
      prisma.bid.count({ where: { active: true, niche: { not: "radiantz" } } }),
      prisma.bid.findMany({
        where: {
          active: true,
          niche: { not: "radiantz" },
          responseDeadline: { gte: now, lte: in48Hours },
        },
        orderBy: { responseDeadline: "asc" },
        take: 2,
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
        take: 3,
        select: {
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

    const urgentPreview = urgent.map((bid) => {
      const hours = hoursUntil(bid.responseDeadline)
      return {
        ...bid,
        locked: false,
        // In the free preview, urgency is more useful than the normal set-aside badge.
        setAside: hours ? `Due in ~${hours}h` : bid.setAside,
      }
    })

    const lockedPreview = later.map((bid) => ({
      title: "",
      agency: null,
      niche: bid.niche,
      postedDate: null,
      responseDeadline: bid.responseDeadline,
      setAside: null,
      locked: true,
    }))

    return NextResponse.json({
      totalActiveBids: total,
      sample: [...urgentPreview, ...lockedPreview],
      urgentSample: urgentPreview,
      lockedSample: lockedPreview,
      hiddenCount: Math.max(total - urgentPreview.length, 0),
      lastSyncedAt: lastSynced?.updatedAt ?? null,
    })
  } catch (error) {
    console.error("public-stats error:", error)
    return NextResponse.json(
      {
        totalActiveBids: 0,
        sample: [],
        urgentSample: [],
        lockedSample: [],
        hiddenCount: 0,
        lastSyncedAt: null,
      },
      { status: 200 }
    )
  }
}
