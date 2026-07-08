import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { NICHES } from "@/lib/niches"
import { fetchOpportunitiesByNaics, formatSamDate } from "@/lib/sam"

export const maxDuration = 300
export const dynamic = "force-dynamic"

const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

// Public-safe manual sync trigger for the radiantz-bids page.
// Unlike /api/cron/sync-bids (secret-protected, syncs ALL niches for all
// paying customers), this route requires no auth but is deliberately scoped
// to ONLY the radiantz niche, and rate-limited via cooldown to prevent abuse
// of the SAM_API_KEY quota / Vercel function time by anyone hitting the link.
export async function GET() {
  const apiKey = process.env.SAM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "SAM_API_KEY not configured" },
      { status: 500 }
    )
  }

  const niche = NICHES.find((n) => n.id === "radiantz")
  if (!niche) {
    return NextResponse.json({ error: "radiantz niche not found" }, { status: 500 })
  }

  const mostRecent = await prisma.bid.findFirst({
    where: { niche: "radiantz" },
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  })

  if (mostRecent && Date.now() - mostRecent.updatedAt.getTime() < COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (COOLDOWN_MS - (Date.now() - mostRecent.updatedAt.getTime())) / 1000
    )
    return NextResponse.json(
      {
        success: false,
        message: `Synced recently - please wait ${waitSeconds}s before syncing again.`,
      },
      { status: 429 }
    )
  }

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const postedFrom = formatSamDate(sevenDaysAgo)
  const postedTo = formatSamDate(today)

  let totalSynced = 0
  let totalErrors = 0
  const seen = new Set<string>()

  for (const naicsCode of niche.naicsCodes) {
    try {
      const opportunities = await fetchOpportunitiesByNaics(
        naicsCode,
        postedFrom,
        postedTo,
        apiKey
      )

      for (const opp of opportunities) {
        if (!opp.noticeId || seen.has(opp.noticeId)) continue
        seen.add(opp.noticeId)

        await prisma.bid.upsert({
          where: { noticeId: opp.noticeId },
          update: {
            title: opp.title,
            agency: opp.fullParentPathName ?? null,
            naicsCode: opp.naicsCode ?? naicsCode,
            niche: niche.id,
            postedDate: opp.postedDate ? new Date(opp.postedDate) : null,
            responseDeadline: opp.responseDeadLine
              ? new Date(opp.responseDeadLine)
              : null,
            setAside: opp.typeOfSetAsideDescription ?? null,
            bidType: opp.type ?? null,
            uiLink: opp.uiLink ?? null,
            active: true,
            updatedAt: new Date(),
          },
          create: {
            noticeId: opp.noticeId,
            title: opp.title,
            solicitationNumber: opp.solicitationNumber ?? null,
            agency: opp.fullParentPathName ?? null,
            naicsCode: opp.naicsCode ?? naicsCode,
            niche: niche.id,
            postedDate: opp.postedDate ? new Date(opp.postedDate) : null,
            responseDeadline: opp.responseDeadLine
              ? new Date(opp.responseDeadLine)
              : null,
            setAside: opp.typeOfSetAsideDescription ?? null,
            bidType: opp.type ?? null,
            uiLink: opp.uiLink ?? null,
            active: true,
          },
        })

        totalSynced++
      }
    } catch (err) {
      console.error(`Error syncing radiantz naics=${naicsCode}:`, err)
      totalErrors++
    }
  }

  await prisma.bid.updateMany({
    where: {
      niche: "radiantz",
      responseDeadline: { lt: new Date() },
      active: true,
    },
    data: { active: false },
  })

  return NextResponse.json({
    success: true,
    totalSynced,
    totalErrors,
    range: { from: postedFrom, to: postedTo },
    syncedAt: new Date().toISOString(),
  })
}
