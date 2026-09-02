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

  if (!NICHE_MAP[nicheId]) {
    return NextResponse.json({ error: "Invalid niche" }, { status: 400 })
  }

  const session = await auth()
  const entitlement = await getEntitlement(session?.user?.id)

  // Former subscribers do not regain a full feed after canceling or going past due.
  // Their prior category selection stays on the account so reactivation resumes history,
  // but full access requires an active or trialing paid period.
  if (session?.user?.id && !entitlement.isGated) {
    const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
    if (sub && sub.status !== "trialing" && sub.status !== "active") {
      return NextResponse.json(
        { error: "Reactivate your subscription to see full category results." },
        { status: 403 }
      )
    }
  }

  if (entitlement.isGated && !entitlement.allowedNicheIds.includes(nicheId)) {
    return NextResponse.json(
      {
        error: entitlement.selectedNiches.length === 0
          ? "Choose your category in Account settings to start seeing full results."
          : "This category isn't part of your current plan. Upgrade or queue a change for your next billing cycle.",
        needsNicheSelection: entitlement.selectedNiches.length === 0,
      },
      { status: 403 }
    )
  }

  // Public/no-subscription access is a demo, not a replacement for the paid feed.
  const isFreePreview = !entitlement.isGated
  const take = isFreePreview ? 5 : 50
  const effectivePage = isFreePreview ? 0 : page

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
        skip: effectivePage * take,
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

    return NextResponse.json({
      bids,
      total,
      page: effectivePage,
      preview: isFreePreview,
      previewLimit: isFreePreview ? 5 : null,
    })
  } catch (error) {
    console.error("Bids API error:", error)
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 })
  }
}
