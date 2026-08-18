import { NextRequest, NextResponse } from "next/server"
import { formatSamDate } from "@/lib/sam"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const apiKey = process.env.SAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "SAM_API_KEY not configured" }, { status: 500 })
  }

  const solnum = req.nextUrl.searchParams.get("solnum")?.trim()
  if (!solnum || solnum.length > 128 || !/^[A-Za-z0-9_(){}\- .]+$/.test(solnum)) {
    return NextResponse.json({ error: "Valid solnum is required" }, { status: 400 })
  }

  const today = new Date()
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const params = new URLSearchParams({
    api_key: apiKey,
    limit: "10",
    offset: "0",
    postedFrom: formatSamDate(oneYearAgo),
    postedTo: formatSamDate(today),
    solnum,
    ptype: "o,k,p",
  })

  const response = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    return NextResponse.json(
      { error: `SAM API returned ${response.status}`, detail: detail.slice(0, 1000) },
      { status: response.status }
    )
  }

  const data = await response.json()
  const opportunities = (data.opportunitiesData ?? []).filter(
    (opp: { solicitationNumber?: string }) =>
      opp.solicitationNumber?.trim().toLowerCase() === solnum.toLowerCase()
  )

  return NextResponse.json({ solnum, total: opportunities.length, opportunities })
}
