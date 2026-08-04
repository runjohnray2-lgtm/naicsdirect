import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { nicheLimitForPriceId, NICHE_LOCK_DAYS } from "@/lib/plans"
import { PUBLIC_NICHES } from "@/lib/niches"
import { getEntitlement } from "@/lib/entitlement"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entitlement = await getEntitlement(session.user.id)
  return NextResponse.json(entitlement)
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
      { error: "Your subscription isn't active. Reactivate your plan to choose niches." },
      { status: 403 }
    )
  }

  const nicheLimit = nicheLimitForPriceId(sub.stripePriceId)
  if (deduped.length > nicheLimit) {
    return NextResponse.json(
      { error: `Your plan allows up to ${nicheLimit} niche${nicheLimit === 1 ? "" : "s"}. Upgrade to select more.` },
      { status: 403 }
    )
  }

  const now = new Date()
  const isFirstPick = sub.selectedNiches.length === 0
  const isLocked = sub.nicheLockedUntil ? sub.nicheLockedUntil > now : false

  // Pure additions (going from e.g. 1 chosen niche up to 3 after an upgrade, keeping the original)
  // don't require the lock to have expired — you're not losing access to anything you already had.
  const isPureAddition = sub.selectedNiches.every((existing) => deduped.includes(existing))

  if (!isFirstPick && !isPureAddition && isLocked) {
    return NextResponse.json(
      {
        error: `You can change your niches again on ${sub.nicheLockedUntil!.toISOString().slice(0, 10)}. Need it sooner? Email support with a reason and we'll take care of it.`,
        nicheLockedUntil: sub.nicheLockedUntil!.toISOString(),
      },
      { status: 423 } // 423 Locked
    )
  }

  const nicheLockedUntil = new Date(now.getTime() + NICHE_LOCK_DAYS * 24 * 60 * 60 * 1000)

  const updated = await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      selectedNiches: deduped,
      nicheLockedUntil,
    },
  })

  return NextResponse.json({
    selectedNiches: updated.selectedNiches,
    nicheLockedUntil: updated.nicheLockedUntil?.toISOString() ?? null,
  })
}
