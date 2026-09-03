import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json({ profile })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const legalName = clean(body.legalName)
  if (!legalName) return NextResponse.json({ error: "Legal business name is required" }, { status: 400 })

  const data = {
    legalName,
    dbaName: clean(body.dbaName),
    uei: clean(body.uei)?.toUpperCase() ?? null,
    cageCode: clean(body.cageCode)?.toUpperCase() ?? null,
    address1: clean(body.address1),
    address2: clean(body.address2),
    city: clean(body.city),
    state: clean(body.state)?.toUpperCase() ?? null,
    zip: clean(body.zip),
    country: clean(body.country) || "USA",
    phone: clean(body.phone),
    quoteEmail: clean(body.quoteEmail),
    website: clean(body.website),
    contactName: clean(body.contactName),
    remitTo: clean(body.remitTo),
  }

  const profile = await prisma.companyProfile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  })

  return NextResponse.json({ profile })
}
