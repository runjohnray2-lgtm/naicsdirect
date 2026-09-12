import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

function quoteDueDate(pursuit: { supplierQuoteDeadline: Date | null; bid: { responseDeadline: Date | null } }) {
  if (pursuit.supplierQuoteDeadline) return pursuit.supplierQuoteDeadline
  if (!pursuit.bid.responseDeadline) return null
  const fallback = new Date(pursuit.bid.responseDeadline)
  fallback.setDate(fallback.getDate() - 3)
  return fallback
}

function formatDate(value: Date | null) {
  if (!value) return "as soon as practical"
  return value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string; supplierId: string }> }
) {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!access.entitled) {
    return NextResponse.json({ error: "An active subscription is required to build supplier RFQs." }, { status: 403 })
  }

  const { id, supplierId } = await context.params
  const [pursuit, profile, user] = await Promise.all([
    prisma.pursuit.findFirst({
      where: { id, userId: access.userId },
      include: {
        bid: true,
        suppliers: { where: { id: supplierId }, take: 1 },
      },
    }),
    prisma.companyProfile.findUnique({ where: { userId: access.userId } }),
    prisma.user.findUnique({ where: { id: access.userId }, select: { name: true, email: true } }),
  ])

  if (!pursuit || pursuit.suppliers.length === 0) {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
  }
  if (!profile?.legalName) {
    return NextResponse.json(
      { error: "Complete your Federal Quote Profile in Account before building supplier RFQs." },
      { status: 409 }
    )
  }

  const supplier = pursuit.suppliers[0]
  const location = [pursuit.bid.placeCity, pursuit.bid.placeState].filter(Boolean).join(", ") || "the project location"
  const companyName = profile.dbaName?.trim() || profile.legalName
  const contactName = profile.contactName?.trim() || user?.name?.trim() || "Purchasing"
  const contactEmail = profile.quoteEmail?.trim() || user?.email || ""
  const contactPhone = profile.phone?.trim() || ""
  const scope = pursuit.supplierScope?.trim() ||
    `${companyName} is evaluating qualified partners for a project involving ${pursuit.bid.title}. We are looking for a firm that can provide the applicable products and/or services in the ${location} area.`
  const due = formatDate(quoteDueDate(pursuit))

  // Supplier-facing RFQ deliberately excludes the agency, solicitation number,
  // government contacts, internal estimate, margin, historical pricing and other
  // prime-contractor strategy. The customer controls supplierScope when more detail is needed.
  const subject = `Pricing request — ${pursuit.bid.title}`
  const contactLines = [contactName, companyName, contactEmail, contactPhone].filter(Boolean).join("\n")
  const body = `Hello,

${companyName} is currently evaluating qualified partners for upcoming work in the ${location} area and would like to determine whether ${supplier.name} is a fit.

${scope}

If this work is within your capabilities, please provide your most competitive project-specific pricing together with:

• what is included in your price
• any exclusions or assumptions
• lead time / earliest availability
• applicable freight, mobilization or travel charges
• warranty or service coverage, where applicable
• confirmation of commercial insurance / licensing where relevant

We are looking for a dependable partner, not simply a generic budget number. Strong pricing, responsiveness and reliable execution can lead to preferred-partner consideration on additional opportunities.

Please return pricing by ${due}, if possible. Project information shared by ${companyName} is confidential and should be used only for evaluating and pricing this request.

Thank you,

${contactLines}`

  return NextResponse.json({
    supplier: { id: supplier.id, name: supplier.name, email: supplier.email },
    subject,
    body,
    confidentiality: {
      governmentBuyerDisclosed: false,
      solicitationNumberDisclosed: false,
      internalPricingDisclosed: false,
      supplierStrategyDisclosed: false,
    },
  })
}
