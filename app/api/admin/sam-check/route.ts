import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { formatSamDate } from "@/lib/sam"

export const dynamic = "force-dynamic"

const ADMIN_EMAILS = new Set(["agent@radiantz.com", "ray@radiantz.com"])

export async function GET(req: Request) {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (!email || !ADMIN_EMAILS.has(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.SAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "SAM_API_KEY not configured" }, { status: 500 })
  }

  const url = new URL(req.url)
  const naicsCode = url.searchParams.get("naics")?.trim() || "423710"
  if (!/^\d{6}$/.test(naicsCode)) {
    return NextResponse.json({ error: "Invalid NAICS code" }, { status: 400 })
  }

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const params = new URLSearchParams({
    api_key: apiKey,
    limit: "5",
    offset: "0",
    postedFrom: formatSamDate(sevenDaysAgo),
    postedTo: formatSamDate(today),
    ncode: naicsCode,
    ptype: "o,k,p",
  })

  const response = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`, { cache: "no-store" })
  const body = await response.text()

  return NextResponse.json({
    naicsCode,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    bodyPreview: body.slice(0, 1000),
  })
}
