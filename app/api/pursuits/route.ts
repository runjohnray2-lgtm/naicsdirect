import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const VALID_DECISIONS = new Set(["WATCH", "PURSUE", "PASS"])

function stageForDecision(decision: string) {
  if (decision === "PURSUE") return "REVIEWING"
  if (decision === "PASS") return "PASSED"
  return "WATCHING"
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pursuits = await prisma.pursuit.findMany({
    where: { userId: session.user.id },
    include: { bid: true },
    orderBy: [
      { decision: "asc" },
      { bid: { responseDeadline: "asc" } },
      { updatedAt: "desc" },
    ],
  })

  return NextResponse.json({ pursuits })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to save bids" }, { status: 401 })
  }

  const body = (await req.json()) as { bidId?: string; decision?: string }
  const noticeId = body.bidId?.trim()
  const decision = body.decision?.toUpperCase()

  if (!noticeId || !decision || !VALID_DECISIONS.has(decision)) {
    return NextResponse.json({ error: "Invalid pursuit request" }, { status: 400 })
  }

  const bid = await prisma.bid.findUnique({ where: { noticeId } })
  if (!bid) {
    return NextResponse.json({ error: "Bid not found" }, { status: 404 })
  }

  const pursuit = await prisma.pursuit.upsert({
    where: {
      userId_bidId: {
        userId: session.user.id,
        bidId: bid.id,
      },
    },
    create: {
      userId: session.user.id,
      bidId: bid.id,
      decision,
      stage: stageForDecision(decision),
      nextAction: decision === "PURSUE" ? "Review solicitation requirements and sourcing path" : null,
    },
    update: {
      decision,
      stage: stageForDecision(decision),
      ...(decision === "PURSUE"
        ? { nextAction: "Review solicitation requirements and sourcing path" }
        : {}),
    },
    include: { bid: true },
  })

  return NextResponse.json({ pursuit })
}
