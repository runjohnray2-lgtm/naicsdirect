import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { discoverLocalSuppliers } from "@/lib/local-suppliers"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

async function paidUserId() {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) {
    return { userId: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (!access.entitled) {
    return {
      userId: null,
      response: NextResponse.json({ error: "An active subscription is required to use supplier discovery." }, { status: 403 }),
    }
  }
  return { userId: access.userId, response: null }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await paidUserId()
  if (!access.userId) return access.response!

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: access.userId },
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  const suppliers = await prisma.supplierCandidate.findMany({
    where: { pursuitId: id },
    orderBy: [{ status: "asc" }, { distanceMiles: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json({ suppliers })
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await paidUserId()
  if (!access.userId) return access.response!

  const { id } = await context.params
  const pursuit = await prisma.pursuit.findFirst({
    where: { id, userId: access.userId },
    include: { bid: true },
  })
  if (!pursuit) return NextResponse.json({ error: "Pursuit not found" }, { status: 404 })

  const body = await req.json().catch(() => ({})) as { radiusMiles?: number }
  const radiusMiles = Math.min(Math.max(Number(body.radiusMiles) || 30, 5), 100)

  if (!pursuit.bid.placeCity || !pursuit.bid.placeState) {
    return NextResponse.json(
      {
        error: "This solicitation does not have a usable performance city/state yet. Refresh the bid data or add the location manually before searching nearby suppliers.",
        needsLocation: true,
      },
      { status: 409 }
    )
  }

  const found = await discoverLocalSuppliers({
    niche: pursuit.bid.niche,
    city: pursuit.bid.placeCity,
    state: pursuit.bid.placeState,
    zip: pursuit.bid.placeZip,
    radiusMiles,
  })

  let added = 0
  for (const supplier of found) {
    const existing = await prisma.supplierCandidate.findFirst({
      where: {
        pursuitId: pursuit.id,
        OR: [
          supplier.sourceId ? { sourceId: supplier.sourceId } : undefined,
          { name: supplier.name, address: supplier.address },
        ].filter(Boolean) as Array<{ sourceId?: string; name?: string; address?: string | null }>,
      },
    })
    if (existing) continue

    await prisma.supplierCandidate.create({
      data: {
        pursuitId: pursuit.id,
        name: supplier.name,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        phone: supplier.phone,
        email: supplier.email,
        website: supplier.website,
        source: "openstreetmap",
        sourceId: supplier.sourceId,
        distanceMiles: supplier.distanceMiles,
      },
    })
    added++
  }

  const suppliers = await prisma.supplierCandidate.findMany({
    where: { pursuitId: pursuit.id },
    orderBy: [{ distanceMiles: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json({
    suppliers,
    discovered: found.length,
    added,
    location: {
      city: pursuit.bid.placeCity,
      state: pursuit.bid.placeState,
      zip: pursuit.bid.placeZip,
    },
    radiusMiles,
  })
}
