import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { NICHES } from "@/lib/niches"
import { fetchOpportunitiesByNaics, formatSamDate } from "@/lib/sam"

export const maxDuration = 300

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.SAM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "SAM_API_KEY not configured" },
      { status: 500 }
    )
  }

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const postedFrom = formatSamDate(sevenDaysAgo)
  const postedTo = formatSamDate(today)

  let totalSynced = 0
  let totalErrors = 0
  const summary: Record<string, number> = {}

  for (const niche of NICHES) {
    let nicheCount = 0
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

          nicheCount++
          totalSynced++
        }
      } catch (err) {
        console.error(`Error syncing niche=${niche.id} naics=${naicsCode}:`, err)
        totalErrors++
      }
    }

    summary[niche.id] = nicheCount
  }

  // Mark expired bids as inactive
  await prisma.bid.updateMany({
    where: {
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
    summary,
    syncedAt: new Date().toISOString(),
  })
}
