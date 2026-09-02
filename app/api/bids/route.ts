import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NICHE_MAP } from "@/lib/niches"
import { isDibbsPosting } from "@/lib/dibbs"
import { getEntitlement } from "@/lib/entitlement"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nicheId = searchParams.get("niche") || ""
  const page = parseInt(searchParams.get("page") || "0", 10)
  const take = 50

  if (!NICHE_MAP[nicheId]) {
    return NextResponse.json({ error: "Invalid niche" }, { status: 400 })
  }

  const session = await auth()
  const entitlement = await getEntitlement(session?.user?.id)

  if (entitlement.isGated && !entitlement.allowedNicheIds.includes(nicheId)) {
    return NextResponse.json(
      {
        error: entitlement.selectedNiches.length === 0
          ? "Choose your niche(s) in Account settings to start seeing full results."
          : "This niche isn't part of your current plan. Manage your niches from Account settings.",
        needsNicheSelection: entitlement.selectedNiches.length === 0,
      },
      { status: 403 }
    )
  }

  try {
    // Radiantz is an internal cross-category watchlist. Query it by its complete
    // NAICS set instead of relying on Bid.niche, because public customer niches
    // intentionally own many of the same NAICS codes.
    const where = nicheId === "radiantz"
      ? { naicsCode: { in: NICHE_MAP.radiantz.naicsCodes }, active: true }
      : { niche: nicheId, active: true }

    const [rawBids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        orderBy: { responseDeadline: "asc" },
        skip: page * take,
        take,
      }),
      prisma.bid.count({ where }),
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
