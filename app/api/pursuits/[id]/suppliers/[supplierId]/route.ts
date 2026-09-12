import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

const VALID_STATUSES = new Set(["NEW", "CONTACTED", "REPLIED", "QUOTED", "DECLINED", "BACKUP", "SELECTED"])

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; supplierId: string }> }
) {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!access.entitled) {
    return NextResponse.json({ error: "An active subscription is required to manage suppliers." }, { status: 403 })
  }

  const { id, supplierId } = await context.params
  const supplier = await prisma.supplierCandidate.findFirst({
    where: {
      id: supplierId,
      pursuitId: id,
      pursuit: { userId: access.userId },
    },
  })
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 })

  const body = await req.json() as Record<string, unknown>
  const data: { status?: string; notes?: string | null } = {}

  if (typeof body.status === "string") {
    const status = body.status.toUpperCase()
    if (!VALID_STATUSES.has(status)) return NextResponse.json({ error: "Invalid supplier status" }, { status: 400 })
    data.status = status
  }
  if (typeof body.notes === "string" || body.notes === null) {
    data.notes = typeof body.notes === "string" ? body.notes.trim() || null : null
  }

  const updated = await prisma.supplierCandidate.update({ where: { id: supplierId }, data })

  const nextAction = data.status === "QUOTED"
    ? "Review supplier quote and update internal pricing"
    : data.status === "REPLIED"
      ? "Review supplier response and request firm pricing if needed"
      : data.status === "CONTACTED"
        ? "Track supplier responses and follow up before the quote deadline"
        : null

  if (nextAction) {
    await prisma.pursuit.update({
      where: { id },
      data: { stage: "SOURCING", nextAction },
    })
  }

  return NextResponse.json({ supplier: updated })
}
