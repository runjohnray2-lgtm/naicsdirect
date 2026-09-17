import { prisma } from "@/lib/db"
import { NICHES, type Niche } from "@/lib/niches"
import { fetchOpportunitiesByNaics, formatSamDate } from "@/lib/sam"

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

function text(value: string | null | undefined) {
  return value ?? null
}

export const SYNC_GROUPS: Record<string, string[]> = {
  internal: NICHES.filter((n) => n.public === false).map((n) => n.id),
  "public-a": ["flooring", "janitorial", "hvac"],
  "public-b": ["furniture", "safety", "electrical"],
  "public-c": ["landscaping", "security", "medical"],
  "public-d": ["hardware", "industrial-equipment", "office-supplies"],
  "public-e": ["signs-printing", "vehicle-parts", "waste-services"],
}

export function nichesForSyncGroup(group: string): Niche[] | null {
  const ids = SYNC_GROUPS[group]
  if (!ids) return null
  const byId = new Map(NICHES.map((n) => [n.id, n]))
  const niches = ids.map((id) => byId.get(id)).filter((n): n is Niche => Boolean(n))
  return niches.length === ids.length ? niches : null
}

export async function syncBidNiches(niches: Niche[], apiKey: string) {
  // Expired notices must disappear even if a later SAM request is slow or fails.
  const expiredResult = await prisma.bid.updateMany({
    where: {
      responseDeadline: { lt: new Date() },
      active: true,
    },
    data: { active: false },
  })

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const postedFrom = formatSamDate(sevenDaysAgo)
  const postedTo = formatSamDate(today)

  let totalSynced = 0
  let totalErrors = 0
  let totalChanges = 0
  let totalMismatchedDeactivated = 0
  const summary: Record<string, number> = {}
  const mismatchSummary: Record<string, number> = {}

  for (const niche of niches) {
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

          const place = opp.placeOfPerformance
          const placeStreet = [place?.streetAddress, place?.streetAddress2].filter(Boolean).join(", ") || null
          const placeCity = place?.city?.name ?? null
          const placeState = place?.state?.code ?? place?.state?.name ?? null
          const placeZip = place?.zip ?? null
          const placeCountry = place?.country?.code ?? place?.country?.name ?? null
          const responseDeadline = opp.responseDeadLine ? new Date(opp.responseDeadLine) : null
          const sourceModifiedAt = opp.modifiedDate ? new Date(opp.modifiedDate) : null

          const existing = await prisma.bid.findUnique({ where: { noticeId: opp.noticeId } })

          const bid = await prisma.bid.upsert({
            where: { noticeId: opp.noticeId },
            update: {
              title: opp.title,
              solicitationNumber: opp.solicitationNumber ?? null,
              agency: opp.fullParentPathName ?? null,
              naicsCode: opp.naicsCode ?? naicsCode,
              classificationCode: opp.classificationCode ?? null,
              niche: niche.id,
              postedDate: opp.postedDate ? new Date(opp.postedDate) : null,
              sourceModifiedAt,
              responseDeadline,
              setAside: opp.typeOfSetAsideDescription ?? null,
              bidType: opp.type ?? null,
              baseType: opp.baseType ?? null,
              uiLink: opp.uiLink ?? null,
              placeStreet,
              placeCity,
              placeState,
              placeZip,
              placeCountry,
              active: responseDeadline ? responseDeadline > new Date() : true,
              updatedAt: new Date(),
            },
            create: {
              noticeId: opp.noticeId,
              title: opp.title,
              solicitationNumber: opp.solicitationNumber ?? null,
              agency: opp.fullParentPathName ?? null,
              naicsCode: opp.naicsCode ?? naicsCode,
              classificationCode: opp.classificationCode ?? null,
              niche: niche.id,
              postedDate: opp.postedDate ? new Date(opp.postedDate) : null,
              sourceModifiedAt,
              responseDeadline,
              setAside: opp.typeOfSetAsideDescription ?? null,
              bidType: opp.type ?? null,
              baseType: opp.baseType ?? null,
              uiLink: opp.uiLink ?? null,
              placeStreet,
              placeCity,
              placeState,
              placeZip,
              placeCountry,
              active: responseDeadline ? responseDeadline > new Date() : true,
            },
          })

          if (existing) {
            const changes = [
              { field: "bidType", changeType: "LIFECYCLE", oldValue: text(existing.bidType), newValue: text(opp.type) },
              { field: "responseDeadline", changeType: "DEADLINE", oldValue: iso(existing.responseDeadline), newValue: iso(responseDeadline) },
              { field: "setAside", changeType: "SET_ASIDE", oldValue: text(existing.setAside), newValue: text(opp.typeOfSetAsideDescription) },
              { field: "classificationCode", changeType: "CLASSIFICATION", oldValue: text(existing.classificationCode), newValue: text(opp.classificationCode) },
              { field: "title", changeType: "CONTENT", oldValue: text(existing.title), newValue: text(opp.title) },
            ].filter((change) => change.oldValue !== change.newValue)

            const revisionChanged = iso(existing.sourceModifiedAt) !== iso(sourceModifiedAt)
            if (revisionChanged && changes.length) {
              await prisma.bidChange.createMany({
                data: changes.map((change) => ({
                  bidId: bid.id,
                  changeType: change.changeType,
                  field: change.field,
                  oldValue: change.oldValue,
                  newValue: change.newValue,
                })),
              })
              totalChanges += changes.length
            }
          }

          nicheCount++
          totalSynced++
        }
      } catch (error) {
        console.error(`Error syncing niche=${niche.id} naics=${naicsCode}:`, error)
        totalErrors++
      }
    }

    summary[niche.id] = nicheCount

    if (niche.public !== false) {
      const mismatch = await prisma.bid.updateMany({
        where: {
          niche: niche.id,
          active: true,
          naicsCode: { notIn: niche.naicsCodes },
        },
        data: { active: false },
      })
      if (mismatch.count > 0) mismatchSummary[niche.id] = mismatch.count
      totalMismatchedDeactivated += mismatch.count
    }
  }

  return {
    success: totalErrors === 0,
    totalSynced,
    totalErrors,
    totalChanges,
    expiredDeactivated: expiredResult.count,
    totalMismatchedDeactivated,
    mismatchSummary,
    range: { from: postedFrom, to: postedTo },
    summary,
    syncedAt: new Date().toISOString(),
  }
}
