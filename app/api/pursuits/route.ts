import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { getEntitlement } from "@/lib/entitlement"

const VALID_DECISIONS = new Set(["WATCH", "PURSUE", "PASS"])

function stageForDecision(decision: string) {
  if (decision === "PURSUE") return "REVIEWING"
  if (decision === "PASS") return "PASSED"
  return "WATCHING"
}

const pursuitInclude = {
  bid: true,
  suppliers: {
    orderBy: [
      { status: "asc" as const },
      { distanceMiles: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
  estimate: true,
  quotes: {
    orderBy: { version: "desc" as const },
    take: 1,
  },
}

async function getActiveUserId() {
  const session = await auth()
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null
  let userId = session?.user?.id ?? null

  if (!userId && sessionEmail) {
    const user = await prisma.user.findUnique({
      where: { email: sessionEmail },
      select: { id: true },
    })
    userId = user?.id ?? null
  }

  if (!userId) return { userId: null, entitled: false }
  const entitlement = await getEntitlement(userId)
  return { userId, entitled: entitlement.isGated }
}

export async function GET() {
  const { userId, entitled } = await getActiveUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!entitled) {
    return NextResponse.json(
      { error: "An active NAICS Direct subscription is required to use pursuit tools." },
      { status: 403 }
    )
  }

  const pursuits = await prisma.pursuit.findMany({
    where: { userId },
    include: pursuitInclude,
    orderBy: [
      { decision: "asc" },
      { bid: { responseDeadline: "asc" } },
      { updatedAt: "desc" },
    ],
  })

  return NextResponse.json({ pursuits })
}

export async function POST(req: Request) {
  const { userId, entitled } = await getActiveUserId()
  if (!userId) {
    return NextResponse.json({ error: "Sign in to save bids" }, { status: 401 })
  }
  if (!entitled) {
    return NextResponse.json(
      { error: "Start a plan to Watch, Pursue, or Pass opportunities." },
      { status: 403 }
    )
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
        userId,
        bidId: bid.id,
      },
    },
    create: {
      userId,
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
    include: pursuitInclude,
  })

  return NextResponse.json({ pursuit })
}

export async function DELETE(req: Request) {
  const { userId, entitled } = await getActiveUserId()
  if (!userId) {
    return NextResponse.json({ error: "Sign in to manage pursuits" }, { status: 401 })
  }
  if (!entitled) {
    return NextResponse.json(
      { error: "An active NAICS Direct subscription is required to manage pursuits." },
      { status: 403 }
    )
  }

  const url = new URL(req.url)
  const pursuitId = url.searchParams.get("id")?.trim()
  if (!pursuitId) {
    return NextResponse.json({ error: "Missing pursuit id" }, { status: 400 })
  }

  const pursuit = await prisma.pursuit.findFirst({
    where: { id: pursuitId, userId },
    select: { id: true },
  })

  if (!pursuit) {
    return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })
  }

  await prisma.pursuit.delete({ where: { id: pursuit.id } })
  return NextResponse.json({ success: true })
}
