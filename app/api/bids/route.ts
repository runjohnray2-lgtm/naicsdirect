import { NextRequest, NextResponse } from "next/server"
import { NICHES } from "@/lib/niches"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nicheId = searchParams.get("niche") || ""

  const niche = NICHES.find(n => n.id === nicheId)
  if (!niche) {
    return NextResponse.json({ error: "Invalid niche" }, { status: 400 })
  }

  try {
    const allHits: Record<string, unknown>[] = []

    for (const term of niche.searchTerms.slice(0, 2)) {
      const url = new URL("https://sam.gov/api/prod/sgs/v1/search/")
      url.searchParams.set("index", "opp")
      url.searchParams.set("q", term)
      url.searchParams.set("page", "0")
      url.searchParams.set("mode", "search")
      url.searchParams.set("is_active", "true")

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/hal+json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 300 },
      })

      if (!response.ok) continue

      const data = await response.json() as { _embedded?: { results?: Record<string, unknown>[] } }
      const hits = data?._embedded?.results || []
      allHits.push(...hits)
    }

    const seen = new Set<string>()
    const unique = allHits.filter(h => {
      const id = h._id as string
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })

    // Filter: not canceled, isActive, not award notice, and response date must be in the future
    const now = new Date()
    const active = unique.filter(h => {
      if (h.isCanceled || !h.isActive || (h.type as { code?: string })?.code === "a") return false
      if (h.responseDate) {
        return new Date(h.responseDate as string) >= now
      }
      return true
    })

    active.sort((a, b) => {
      const da = a.responseDate ? new Date(a.responseDate as string).getTime() : Infinity
      const db = b.responseDate ? new Date(b.responseDate as string).getTime() : Infinity
      return da - db
    })

    const bids = active.map(h => ({
      id: h._id as string,
      title: (h.title as string) || "Untitled Solicitation",
      solicitationNumber: (h.solicitationNumber as string) || "",
      responseDate: (h.responseDate as string) || "",
      type: (h.type as { value?: string })?.value || "Notice",
      typeCode: (h.type as { code?: string })?.code || "",
      agency: ((h.organizationHierarchy as Array<{ name?: string }>)?.[0]?.name) || "Unknown Agency",
      subAgency: ((h.organizationHierarchy as Array<{ name?: string }>)?.[1]?.name) || "",
      publishDate: (h.publishDate as string) || "",
      isActive: h.isActive as boolean,
    }))

    return NextResponse.json({ bids, total: bids.length, page: 0 })
  } catch (error) {
    console.error("SAM API error:", error)
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 })
  }
}
