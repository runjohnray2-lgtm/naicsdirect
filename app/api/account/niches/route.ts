import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { nicheLimitForPriceId } from "@/lib/plans"
import { PUBLIC_NICHES } from "@/lib/niches"
import { getEntitlement } from "@/lib/entitlement"

function parsePending(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(",").map((v) => v.trim()).filter(Boolean)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entitlement = await getEntitlement(session.user.id)
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })

  let pendingNiches: string[] = []
  if (sub?.stripeSubscriptionId && (sub.status === "trialing" || sub.status === "active")) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
      pendingNiches = parsePending(stripeSub.metadata?.pending_niches)
    } catch {
      pendingNiches = []
    }
  }

  return NextResponse.json({
    ...entitlement,
    pendingNiches,
    billingPeriodEnd: sub?.stripeCurrentPeriodEnd?.toISOString() ?? null,
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { niches } = (await req.json()) as { niches?: string[] }
  if (!Array.isArray(niches) || niches.length === 0) {
    return NextResponse.json({ error: "Select at least one niche" }, { status: 400 })
  }

  const validIds = new Set(PUBLIC_NICHES.map((n) => n.id))
  const deduped = Array.from(new Set(niches))
  if (deduped.some((id) => !validIds.has(id))) {
    return NextResponse.json({ error: "Unknown niche id" }, { status: 400 })
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  if (!sub) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 })
  }

  if (sub.status !== "trialing" && sub.status !== "active") {
    return NextResponse.json(
      { error: "Your subscription isn't active. Reactivate your plan to manage categories." },
      { status: 403 }
    )
  }

  const nicheLimit = nicheLimitForPriceId(sub.stripePriceId)
  if (deduped.length > nicheLimit) {
    return NextResponse.json(
      { error: `Your plan allows up to ${nicheLimit} categor${nicheLimit === 1 ? "y" : "ies"}. Upgrade to select more.` },
      { status: 403 }
    )
  }

  if (!sub.stripeSubscriptionId) {
    return NextResponse.json({ error: "Billing subscription is not linked yet." }, { status: 409 })
  }

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
  const periodEnd = new Date(stripeSub.current_period_end * 1000)
  const isFirstPick = sub.selectedNiches.length === 0
  const isPureAddition = sub.selectedNiches.every((existing) => deduped.includes(existing))

  // First selection is active immediately. Adding extra categories after a paid
  // upgrade is also immediate, because the customer is paying for more access.
  if (isFirstPick || isPureAddition) {
    const updated = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        selectedNiches: deduped,
        nicheLockedUntil: periodEnd,
        stripeCurrentPeriodEnd: periodEnd,
      },
    })

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      metadata: {
        ...stripeSub.metadata,
        pending_niches: "",
        pending_niches_effective_at: "",
      },
    })

    return NextResponse.json({
      selectedNiches: updated.selectedNiches,
      pendingNiches: [],
      nicheLockedUntil: periodEnd.toISOString(),
      billingPeriodEnd: periodEnd.toISOString(),
      queued: false,
    })
  }

  // Swaps/removals never change the current paid month. They are queued in Stripe
  // metadata and become active only after the next billing cycle starts.
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    metadata: {
      ...stripeSub.metadata,
      pending_niches: deduped.join(","),
      pending_niches_effective_at: String(stripeSub.current_period_end),
    },
  })

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      nicheLockedUntil: periodEnd,
      stripeCurrentPeriodEnd: periodEnd,
    },
  })

  return NextResponse.json({
    selectedNiches: sub.selectedNiches,
    pendingNiches: deduped,
    nicheLockedUntil: periodEnd.toISOString(),
    billingPeriodEnd: periodEnd.toISOString(),
    queued: true,
  })
}
