import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const preference = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  })
  return NextResponse.json({ preference })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json() as Record<string, unknown>
  const data: Record<string, unknown> = {}
  for (const key of ["emailNewPosts", "emailDeadlines", "smsNewPosts", "smsDeadlines"] as const) {
    if (typeof body[key] === "boolean") data[key] = body[key]
  }

  if (typeof body.phone === "string") {
    const phone = body.phone.trim()
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return NextResponse.json({ error: "Use an international phone number such as +15415551212" }, { status: 400 })
    }
    data.phone = phone || null
  }

  if (Array.isArray(body.deadlineHours)) {
    const values = body.deadlineHours.map(Number).filter(v => Number.isInteger(v) && v >= 1 && v <= 720)
    if (!values.length) return NextResponse.json({ error: "Choose at least one deadline reminder" }, { status: 400 })
    data.deadlineHours = [...new Set(values)].sort((a, b) => b - a)
  }

  if (typeof body.timezone === "string" && body.timezone.length <= 80) data.timezone = body.timezone

  const wantsSms = data.smsNewPosts === true || data.smsDeadlines === true
  const current = await prisma.notificationPreference.findUnique({ where: { userId: session.user.id } })
  const effectivePhone = (data.phone ?? current?.phone) as string | null | undefined
  if (wantsSms && !effectivePhone) return NextResponse.json({ error: "Add a mobile number before enabling text alerts" }, { status: 400 })
  if (wantsSms && !current?.smsConsentAt) data.smsConsentAt = new Date()

  const preference = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  })
  return NextResponse.json({ preference })
}
