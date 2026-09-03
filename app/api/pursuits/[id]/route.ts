import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const VALID_STAGES = new Set([
  "WATCHING",
  "REVIEWING",
  "SOURCING",
  "PRICING",
  "READY_TO_SUBMIT",
  "SUBMITTED",
  "WON",
  "LOST",
  "PASSED",
])

const VALID_PRIORITIES = new Set(["LOW", "NORMAL", "HIGH"])
const BOOLEAN_FIELDS = [
  "scopeReviewed",
  "complianceReviewed",
  "submissionInstructionsReviewed",
  "amendmentsChecked",
] as const

const detailInclude = {
  bid: {
    include: {
      changes: {
        orderBy: { detectedAt: "desc" as const },
        take: 30,
      },
    },
  },
  suppliers: {
    orderBy: [{ status: "asc" as const }, { distanceMiles: "asc" as const }, { createdAt: "asc" as const }],
  },
  estimate: true,
  quotes: {
    orderBy: { version: "desc" as const },
  },
}

function parseOptionalDate(value: unknown) {
  if (value === null || value === "") return null
  if (typeof value !== "string") return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
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
    include: detailInclude,
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  return NextResponse.json({ pursuit })
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const current = await prisma.pursuit.findFirst({ where: { id, userId: session.user.id } })
  if (!current) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  const body = (await req.json()) as Record<string, unknown>
  const data: Record<string, unknown> = {}

  if (typeof body.stage === "string") {
    const stage = body.stage.toUpperCase()
    if (!VALID_STAGES.has(stage)) return NextResponse.json({ error: "Invalid stage" }, { status: 400 })
    data.stage = stage
    if (stage === "PASSED") data.decision = "PASS"
    if (stage !== "PASSED" && current.decision !== "PURSUE") data.decision = "PURSUE"
  }

  if (typeof body.priority === "string") {
    const priority = body.priority.toUpperCase()
    if (!VALID_PRIORITIES.has(priority)) return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    data.priority = priority
  }

  if (typeof body.notes === "string" || body.notes === null) data.notes = body.notes
  if (typeof body.nextAction === "string" || body.nextAction === null) data.nextAction = body.nextAction
  if (typeof body.supplierScope === "string" || body.supplierScope === null) {
    data.supplierScope = typeof body.supplierScope === "string" ? body.supplierScope.trim() || null : null
  }

  for (const field of BOOLEAN_FIELDS) {
    if (typeof body[field] === "boolean") data[field] = body[field]
  }

  if ("questionDeadline" in body) {
    const value = parseOptionalDate(body.questionDeadline)
    if (value === undefined) return NextResponse.json({ error: "Invalid question deadline" }, { status: 400 })
    data.questionDeadline = value
  }

  if ("supplierQuoteDeadline" in body) {
    const value = parseOptionalDate(body.supplierQuoteDeadline)
    if (value === undefined) return NextResponse.json({ error: "Invalid supplier deadline" }, { status: 400 })
    data.supplierQuoteDeadline = value
  }

  const pursuit = await prisma.pursuit.update({
    where: { id },
    data,
    include: detailInclude,
  })
  return NextResponse.json({ pursuit })
}
