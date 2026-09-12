import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function safeValidity(value: unknown) {
  const number = Math.round(Number(value ?? 30))
  return Number.isFinite(number) && number >= 1 && number <= 120 ? number : 30
}

async function paidUser() {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) {
    return { userId: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (!access.entitled) {
    return {
      userId: null,
      response: NextResponse.json({ error: "An active subscription is required to use the quote builder." }, { status: 403 }),
    }
  }
  return { userId: access.userId, response: null }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await paidUser()
  if (!access.userId) return access.response!

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: access.userId },
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
  const access = await paidUser()
  if (!access.userId) return access.response!

  const { id } = await context.params
  const [pursuit, companyProfile, user] = await Promise.all([
    prisma.pursuit.findFirst({
      where: { id, userId: access.userId },
      include: { bid: true, estimate: true },
    }),
    prisma.companyProfile.findUnique({ where: { userId: access.userId } }),
    prisma.user.findUnique({ where: { id: access.userId }, select: { email: true, name: true } }),
  ])
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })
  if (!pursuit.estimate || pursuit.estimate.recommendedPrice <= 0) {
    return NextResponse.json(
      { error: "Save an internal estimate before building the customer quote." },
      { status: 409 }
    )
  }
  if (!companyProfile?.legalName) {
    return NextResponse.json(
      { error: "Complete your Federal Quote Profile in Account before building a federal quote." },
      { status: 409 }
    )
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const solicitationRef = pursuit.bid.solicitationNumber || pursuit.bid.noticeId
  const place = [pursuit.bid.placeCity, pursuit.bid.placeState].filter(Boolean).join(", ")
  const defaultScope = `${companyProfile.legalName} proposes to furnish the products and/or services required for ${pursuit.bid.title}. Performance will be in accordance with the applicable solicitation requirements, incorporated specifications, amendments, and accepted clarifications.`
  const defaultAssumptions = "Pricing is based on the solicitation requirements available as of the quote date. Material changes to quantities, scope, schedule, site conditions, incorporated requirements, or amendments may require a revised quotation."
  const defaultDelivery = place
    ? `Delivery/performance will be coordinated for ${place} in accordance with the required solicitation schedule.`
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

  const companySnapshot = {
    legalName: companyProfile.legalName,
    dbaName: companyProfile.dbaName,
    uei: companyProfile.uei,
    cageCode: companyProfile.cageCode,
    address1: companyProfile.address1,
    address2: companyProfile.address2,
    city: companyProfile.city,
    state: companyProfile.state,
    zip: companyProfile.zip,
    country: companyProfile.country,
    phone: companyProfile.phone,
    quoteEmail: companyProfile.quoteEmail || user?.email || null,
    website: companyProfile.website,
    contactName: companyProfile.contactName || user?.name || null,
    remitTo: companyProfile.remitTo,
  }

  const quote = await prisma.quoteDraft.create({
    data: {
      pursuitId: id,
      version,
      status: "DRAFT",
      title,
      scopeText: `${scopeText}\n\nSolicitation: ${solicitationRef}`,
      assumptionsText,
      deliveryText,
      validityDays,
      totalPrice: pursuit.estimate.recommendedPrice,
      companySnapshot,
    },
  })

  await prisma.pursuit.update({
    where: { id },
    data: {
      stage: "READY_TO_SUBMIT",
      nextAction: "Verify the quote against the solicitation's exact submission instructions, amendments, evaluation factors, required forms, and representations before submission",
    },
  })

  return NextResponse.json({ quote })
}
