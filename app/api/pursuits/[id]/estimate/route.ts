import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const COST_FIELDS = [
  "supplierCost",
  "freightCost",
  "laborCost",
  "financingCost",
  "contingencyCost",
  "otherCost",
] as const

function moneyInput(value: unknown) {
  const number = Number(value ?? 0)
  if (!Number.isFinite(number) || number < 0) return null
  return Math.round(number * 100) / 100
}

function calculatePrice(costs: number[], marginPct: number) {
  const totalCost = Math.round(costs.reduce((sum, value) => sum + value, 0) * 100) / 100
  const marginRate = marginPct / 100
  const recommendedPrice = marginRate >= 1
    ? totalCost
    : Math.round((totalCost / (1 - marginRate)) * 100) / 100
  const grossProfit = Math.round((recommendedPrice - totalCost) * 100) / 100
  return { totalCost, recommendedPrice, grossProfit }
}

async function ownedPursuit(id: string, userId: string) {
  return prisma.pursuit.findFirst({ where: { id, userId } })
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  if (!(await ownedPursuit(id, session.user.id))) {
    return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })
  }

  const estimate = await prisma.pursuitEstimate.findUnique({ where: { pursuitId: id } })
  if (!estimate) return NextResponse.json({ estimate: null })

  const costs = COST_FIELDS.map(field => estimate[field])
  const math = calculatePrice(costs, estimate.targetMarginPct)
  return NextResponse.json({ estimate: { ...estimate, ...math } })
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  if (!(await ownedPursuit(id, session.user.id))) {
    return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })
  }

  const body = await req.json() as Record<string, unknown>
  const parsed: Record<string, number> = {}
  for (const field of COST_FIELDS) {
    const value = moneyInput(body[field])
    if (value === null) return NextResponse.json({ error: `${field} must be zero or greater` }, { status: 400 })
    parsed[field] = value
  }

  const targetMarginPct = Number(body.targetMarginPct ?? 20)
  if (!Number.isFinite(targetMarginPct) || targetMarginPct < 0 || targetMarginPct > 90) {
    return NextResponse.json({ error: "Target margin must be between 0% and 90%" }, { status: 400 })
  }

  const costs = COST_FIELDS.map(field => parsed[field])
  const math = calculatePrice(costs, targetMarginPct)
  const internalNotes = typeof body.internalNotes === "string" ? body.internalNotes.trim() || null : null

  const estimate = await prisma.pursuitEstimate.upsert({
    where: { pursuitId: id },
    create: {
      pursuitId: id,
      supplierCost: parsed.supplierCost,
      freightCost: parsed.freightCost,
      laborCost: parsed.laborCost,
      financingCost: parsed.financingCost,
      contingencyCost: parsed.contingencyCost,
      otherCost: parsed.otherCost,
      targetMarginPct,
      recommendedPrice: math.recommendedPrice,
      internalNotes,
    },
    update: {
      supplierCost: parsed.supplierCost,
      freightCost: parsed.freightCost,
      laborCost: parsed.laborCost,
      financingCost: parsed.financingCost,
      contingencyCost: parsed.contingencyCost,
      otherCost: parsed.otherCost,
      targetMarginPct,
      recommendedPrice: math.recommendedPrice,
      internalNotes,
    },
  })

  await prisma.pursuit.update({
    where: { id },
    data: {
      stage: "PRICING",
      nextAction: "Review internal estimate and build customer-facing quote",
    },
  })

  return NextResponse.json({ estimate: { ...estimate, ...math } })
}
