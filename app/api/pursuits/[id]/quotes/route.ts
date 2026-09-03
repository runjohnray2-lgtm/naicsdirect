import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function safeValidity(value: unknown) {
  const number = Math.round(Number(value ?? 30))
  return Number.isFinite(number) && number >= 1 && number <= 120 ? number : 30
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  const quotes = await prisma.quoteDraft.findMany({
    where: { pursuitId: id },
    orderBy: { version: "desc" },
  })
  return NextResponse.json({ quotes })
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: session.user.id },
    include: { bid: true, estimate: true },
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })
  if (!pursuit.estimate || pursuit.estimate.recommendedPrice <= 0) {
    return NextResponse.json(
      { error: "Save an internal estimate before building the customer quote." },
      { status: 409 }
    )
  }

  // SECURITY BOUNDARY: the quote is constructed only from public/customer-safe bid fields,
  // user-entered customer-facing text, and the final recommended price. Supplier costs,
  // margin percentage, financing costs, contingency, internal notes, and supplier identities
  // are intentionally not selected into or interpolated into any quote text below.
  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const solicitationRef = pursuit.bid.solicitationNumber || pursuit.bid.noticeId
  const place = [pursuit.bid.placeCity, pursuit.bid.placeState].filter(Boolean).join(", ")
  const defaultScope = `Radiantz proposes to furnish the products and/or services required for ${pursuit.bid.title}. Performance will be in accordance with the applicable solicitation requirements, incorporated specifications, and accepted clarifications.`
  const defaultAssumptions = "Pricing is based on the requirements available as of the quote date. Material changes to quantities, scope, schedule, site conditions, or incorporated requirements may require a revised quotation."
  const defaultDelivery = place
    ? `Delivery/performance will be coordinated for ${place} in accordance with the required schedule.`
    : "Delivery/performance will be completed in accordance with the required solicitation schedule."

  const title = cleanText(body.title, `Quotation — ${pursuit.bid.title}`)
  const scopeText = cleanText(body.scopeText, defaultScope)
  const assumptionsText = cleanText(body.assumptionsText, defaultAssumptions)
  const deliveryText = cleanText(body.deliveryText, defaultDelivery)
  const validityDays = safeValidity(body.validityDays)

  const latest = await prisma.quoteDraft.findFirst({
    where: { pursuitId: id },
    orderBy: { version: "desc" },
    select: { version: true },
  })
  const version = (latest?.version ?? 0) + 1

  const quote = await prisma.quoteDraft.create({
    data: {
      pursuitId: id,
      version,
      status: "DRAFT",
      title,
      scopeText: `${scopeText}\n\nReference: ${solicitationRef}`,
      assumptionsText,
      deliveryText,
      validityDays,
      totalPrice: pursuit.estimate.recommendedPrice,
    },
  })

  await prisma.pursuit.update({
    where: { id },
    data: {
      stage: "READY_TO_SUBMIT",
      nextAction: "Review customer-facing quote against solicitation instructions before submission",
    },
  })

  return NextResponse.json({ quote })
}
