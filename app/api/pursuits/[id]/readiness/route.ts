import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!access.entitled) {
    return NextResponse.json({ error: "An active subscription is required to use pursuit readiness tools." }, { status: 403 })
  }

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: access.userId },
    include: {
      bid: true,
      suppliers: true,
      estimate: true,
      quotes: { orderBy: { version: "desc" }, take: 1 },
    },
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  const supplierProgress = pursuit.suppliers.some(supplier =>
    ["REPLIED", "QUOTED", "SELECTED"].includes(supplier.status)
  )
  const supplierQuoted = pursuit.suppliers.some(supplier =>
    ["QUOTED", "SELECTED"].includes(supplier.status)
  )

  const checks = [
    { id: "deadline", label: "Government response deadline identified", complete: Boolean(pursuit.bid.responseDeadline), automatic: true },
    { id: "scope", label: "Scope and requirements reviewed", complete: pursuit.scopeReviewed, automatic: false },
    { id: "compliance", label: "Set-aside, origin, clauses and compliance reviewed", complete: pursuit.complianceReviewed, automatic: false },
    { id: "amendments", label: "Latest amendments / notice changes checked", complete: pursuit.amendmentsChecked, automatic: false },
    { id: "suppliers", label: "Supplier / subcontractor sourcing started", complete: pursuit.suppliers.length > 0, automatic: true },
    { id: "supplier-response", label: "At least one supplier has responded", complete: supplierProgress, automatic: true },
    { id: "supplier-quote", label: "At least one supplier quote received", complete: supplierQuoted, automatic: true },
    { id: "estimate", label: "Internal estimate and target price saved", complete: Boolean(pursuit.estimate && pursuit.estimate.recommendedPrice > 0), automatic: true },
    { id: "quote", label: "Customer-facing quote draft built", complete: pursuit.quotes.length > 0, automatic: true },
    { id: "submission", label: "Submission instructions and required forms reviewed", complete: pursuit.submissionInstructionsReviewed, automatic: false },
  ]

  const completed = checks.filter(check => check.complete).length
  const score = Math.round((completed / checks.length) * 100)
  const blockers = checks.filter(check => !check.complete).map(check => check.label)

  return NextResponse.json({
    score,
    completed,
    total: checks.length,
    ready: score === 100,
    checks,
    blockers,
  })
}
