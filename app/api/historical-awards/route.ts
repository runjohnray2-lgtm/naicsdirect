import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type UsaSpendingResult = Record<string, unknown>

function isoDateYearsAgo(years: number) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword")?.trim() ?? ""
  const naics = req.nextUrl.searchParams.get("naics")?.trim() ?? ""
  const yearsRaw = Number(req.nextUrl.searchParams.get("years") ?? "5")
  const years = Number.isFinite(yearsRaw) ? Math.min(Math.max(Math.round(yearsRaw), 1), 10) : 5

  if (!keyword && !naics) {
    return NextResponse.json({ error: "Provide keyword and/or naics" }, { status: 400 })
  }
  if (keyword.length > 160 || (naics && !/^\d{2,6}$/.test(naics))) {
    return NextResponse.json({ error: "Invalid search parameters" }, { status: 400 })
  }

  const filters: Record<string, unknown> = {
    time_period: [{ start_date: isoDateYearsAgo(years), end_date: new Date().toISOString().slice(0, 10) }],
    award_type_codes: ["A", "B", "C", "D"],
  }
  if (keyword) filters.keywords = [keyword]
  if (naics) filters.naics_codes = [naics]

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
    limit: 25,
    sort: "Start Date",
    order: "desc",
  }

  try {
    const response = await fetch("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error("USAspending lookup failed", response.status, data)
      return NextResponse.json({ error: `USAspending returned ${response.status}` }, { status: 502 })
    }

    const results = Array.isArray(data.results) ? (data.results as UsaSpendingResult[]) : []
    return NextResponse.json({
      source: "USAspending.gov",
      keyword,
      naics,
      years,
      count: results.length,
      results,
      disclaimer: "Award totals are historical contract/transaction values, not necessarily per-unit prices. Match part/NSN/quantity before deriving a unit-price target.",
    })
  } catch (error) {
    console.error("USAspending lookup error", error)
    return NextResponse.json({ error: "Historical award lookup failed" }, { status: 500 })
  }
}
