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

  // Gated (trialing/active) subscribers only get full results for niches they've actually
  // chosen. Anonymous visitors and lapsed/no-subscription users keep today's free-preview
  // behavior — this restriction only ever applies to paying/trialing customers, never removes
  // the public "browse free, no signup" funnel.
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
