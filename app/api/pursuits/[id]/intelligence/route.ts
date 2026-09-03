import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { formatSamDate } from "@/lib/sam"

function yearsAgo(years: number) {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date.toISOString().slice(0, 10)
}

function compactOpportunity(opp: Record<string, unknown> | null) {
  if (!opp) return null
  return {
    title: opp.title ?? null,
    solicitationNumber: opp.solicitationNumber ?? null,
    postedDate: opp.postedDate ?? null,
    responseDeadLine: opp.responseDeadLine ?? null,
    type: opp.type ?? null,
    typeOfSetAsideDescription: opp.typeOfSetAsideDescription ?? null,
    naicsCode: opp.naicsCode ?? null,
    classificationCode: opp.classificationCode ?? null,
    description: opp.description ?? null,
    uiLink: opp.uiLink ?? null,
    resourceLinks: Array.isArray(opp.resourceLinks) ? opp.resourceLinks : [],
    pointOfContact: Array.isArray(opp.pointOfContact) ? opp.pointOfContact : [],
    placeOfPerformance: opp.placeOfPerformance ?? null,
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: session.user.id },
    include: { bid: true },
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  let samDetail: Record<string, unknown> | null = null
  let samError: string | null = null
  const apiKey = process.env.SAM_API_KEY
  if (apiKey && pursuit.bid.solicitationNumber) {
    try {
      const today = new Date()
      const twoYearsAgo = new Date(today)
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      const params = new URLSearchParams({
        api_key: apiKey,
        limit: "10",
        offset: "0",
        postedFrom: formatSamDate(twoYearsAgo),
        postedTo: formatSamDate(today),
        solnum: pursuit.bid.solicitationNumber,
        ptype: "o,k,p,r,s",
      })
      const response = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        const exact = (data.opportunitiesData ?? []).find((opp: { solicitationNumber?: string }) =>
          opp.solicitationNumber?.trim().toLowerCase() === pursuit.bid.solicitationNumber?.trim().toLowerCase()
        )
        samDetail = compactOpportunity(exact ?? null)
      } else {
        samError = `SAM.gov returned ${response.status}`
      }
    } catch {
      samError = "SAM.gov detail lookup failed"
    }
  } else if (!apiKey) {
    samError = "SAM API key is not configured"
  } else {
    samError = "No solicitation number is available for the detail lookup"
  }

  let historicalAwards: Record<string, unknown>[] = []
  let historicalError: string | null = null
  if (pursuit.bid.naicsCode) {
    try {
      const filters: Record<string, unknown> = {
        time_period: [{ start_date: yearsAgo(5), end_date: new Date().toISOString().slice(0, 10) }],
        award_type_codes: ["A", "B", "C", "D"],
        naics_codes: [pursuit.bid.naicsCode],
      }
      const body = {
        filters,
        fields: [
          "Award ID",
          "Recipient Name",
          "Start Date",
          "End Date",
          "Award Amount",
          "Total Obligation",
          "Awarding Agency",
          "Awarding Sub Agency",
          "Award Type",
          "Description",
          "NAICS Code",
          "PSC Code",
        ],
        page: 1,
        limit: 15,
        sort: "Start Date",
        order: "desc",
      }
      const response = await fetch("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        historicalAwards = Array.isArray(data.results) ? data.results : []
      } else {
        historicalError = `USAspending returned ${response.status}`
      }
    } catch {
      historicalError = "Historical award lookup failed"
    }
  }

  return NextResponse.json({
    sam: { detail: samDetail, error: samError },
    historical: {
      source: "USAspending.gov",
      results: historicalAwards,
      error: historicalError,
      disclaimer: "Historical award totals are contract/transaction values, not guaranteed future prices or unit prices. Confirm scope, quantity and period before using them as pricing context.",
    },
  })
}
