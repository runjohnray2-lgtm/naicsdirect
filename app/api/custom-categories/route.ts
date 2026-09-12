import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(v => String(v).trim()).filter(Boolean))]
}

async function paidUserId() {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) {
    return { userId: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (!access.entitled) {
    return {
      userId: null,
      response: NextResponse.json({ error: "Start a plan to create personal bid categories." }, { status: 403 }),
    }
  }
  return { userId: access.userId, response: null }
}

export async function GET() {
  const access = await paidUserId()
  if (!access.userId) return access.response!
  const categories = await prisma.customCategory.findMany({
    where: { userId: access.userId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  const access = await paidUserId()
  if (!access.userId) return access.response!
  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 })

  const category = await prisma.customCategory.create({
    data: {
      userId: access.userId,
      name,
      keywords: normalizeList(body.keywords),
      excludedKeywords: normalizeList(body.excludedKeywords),
      naicsCodes: normalizeList(body.naicsCodes),
      states: normalizeList(body.states).map(v => v.toUpperCase()),
      agencies: normalizeList(body.agencies),
      setAsides: normalizeList(body.setAsides),
      emailAlerts: body.emailAlerts === undefined ? true : Boolean(body.emailAlerts),
      smsAlerts: Boolean(body.smsAlerts),
    },
  })
  return NextResponse.json({ category }, { status: 201 })
}
