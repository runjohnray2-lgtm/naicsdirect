import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { NICHE_MAP } from "@/lib/niches"
import { isDibbsPosting } from "@/lib/dibbs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nicheId = searchParams.get("niche") || ""
  const page = parseInt(searchParams.get("page") || "0", 10)
  const take = 50

  if (!NICHE_MAP[nicheId]) {
    return NextResponse.json({ error: "Invalid niche" }, { status: 400 })
  }

  try {
    const [rawBids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { niche: nicheId, active: true },
        orderBy: { responseDeadline: "asc" },
        skip: page * take,
        take,
      }),
      prisma.bid.count({ where: { niche: nicheId, active: true } }),
    ])

    const bids = rawBids.map((b) => ({
      id: b.noticeId,
      title: b.title,
      solicitationNumber: b.solicitationNumber ?? "",
      responseDate: b.responseDeadline?.toISOString() ?? "",
      type: b.bidType ?? "Notice",
      typeCode: "",
      agency: b.agency ?? "Unknown Agency",
      subAgency: "",
      publishDate: b.postedDate?.toISOString() ?? "",
      setAside: b.setAside ?? "",
      uiLink: b.uiLink ?? "",
      naicsCode: b.naicsCode ?? "",
      isActive: b.active,
      isDibbs: isDibbsPosting(b.agency, b.title),
    }))

    return NextResponse.json({ bids, total, page })
  } catch (error) {
    console.error("Bids API error:", error)
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 })
  }
}
