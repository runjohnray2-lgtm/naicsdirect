import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) return undefined
  return [...new Set(value.map(v => String(v).trim()).filter(Boolean))]
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.customCategory.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 })

  const body = await req.json()
  const keywords = normalizeList(body.keywords)
  const excludedKeywords = normalizeList(body.excludedKeywords)
  const naicsCodes = normalizeList(body.naicsCodes)
  const states = normalizeList(body.states)
  const agencies = normalizeList(body.agencies)
  const setAsides = normalizeList(body.setAsides)

  const category = await prisma.customCategory.update({
    where: { id },
    data: {
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
      keywords,
      excludedKeywords,
      naicsCodes,
      states: states?.map(v => v.toUpperCase()),
      agencies,
      setAsides,
      active: typeof body.active === "boolean" ? body.active : undefined,
      emailAlerts: typeof body.emailAlerts === "boolean" ? body.emailAlerts : undefined,
      smsAlerts: typeof body.smsAlerts === "boolean" ? body.smsAlerts : undefined,
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.customCategory.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 })
  await prisma.customCategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
