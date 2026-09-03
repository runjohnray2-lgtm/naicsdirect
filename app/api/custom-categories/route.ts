import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(v => String(v).trim()).filter(Boolean))]
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const categories = await prisma.customCategory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 })

  const category = await prisma.customCategory.create({
    data: {
      userId: session.user.id,
      name,
      keywords: normalizeList(body.keywords),
      naicsCodes: normalizeList(body.naicsCodes),
      states: normalizeList(body.states).map(v => v.toUpperCase()),
      agencies: normalizeList(body.agencies),
      emailAlerts: body.emailAlerts === undefined ? true : Boolean(body.emailAlerts),
      smsAlerts: Boolean(body.smsAlerts),
    },
  })
  return NextResponse.json({ category }, { status: 201 })
}
