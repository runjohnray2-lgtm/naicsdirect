import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

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
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, supplierId } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: session.user.id },
    include: {
      bid: true,
      suppliers: { where: { id: supplierId }, take: 1 },
    },
  })
  if (!pursuit || pursuit.suppliers.length === 0) {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
  }

  const supplier = pursuit.suppliers[0]
  const location = [pursuit.bid.placeCity, pursuit.bid.placeState].filter(Boolean).join(", ") || "the project location"
  const scope = pursuit.supplierScope?.trim() ||
    `Radiantz is evaluating qualified partners for a project involving ${pursuit.bid.title}. We are looking for a firm that can provide the applicable products and/or services in the ${location} area.`
  const due = formatDate(quoteDueDate(pursuit))

  // Supplier-facing RFQ deliberately excludes the agency, solicitation number,
  // government contacts, internal estimate, margin, historical pricing and other
  // prime-contractor strategy. The user controls supplierScope when more detail is needed.
  const subject = `Pricing request — ${pursuit.bid.title}`
  const body = `Hello,

Radiantz is currently evaluating qualified partners for upcoming work in the ${location} area and would like to determine whether ${supplier.name} is a fit.

${scope}

If this work is within your capabilities, please provide your most competitive project-specific pricing together with:

• what is included in your price
• any exclusions or assumptions
• lead time / earliest availability
• applicable freight, mobilization or travel charges
• warranty or service coverage, where applicable
• confirmation of commercial insurance / licensing where relevant

We are looking for a dependable partner, not simply a generic budget number. Strong pricing, responsiveness and reliable execution can lead to preferred-partner consideration on additional opportunities.

Please return pricing by ${due}, if possible. Project information shared by Radiantz is confidential and should be used only for evaluating and pricing this request.

Thank you,

Ray Runyan
Radiantz
agent@radiantz.com
541-275-0101`

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
