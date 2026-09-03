import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { isDibbsPosting } from "@/lib/dibbs"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const category = await prisma.customCategory.findFirst({ where: { id, userId: session.user.id } })
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 })

  const filters: Record<string, unknown>[] = [{ active: true }]
  if (category.naicsCodes.length) filters.push({ naicsCode: { in: category.naicsCodes } })
  if (category.states.length) filters.push({ placeState: { in: category.states, mode: "insensitive" } })
  if (category.agencies.length) {
    filters.push({ OR: category.agencies.map(agency => ({ agency: { contains: agency, mode: "insensitive" } })) })
  }
  if (category.keywords.length) {
    filters.push({
      OR: category.keywords.flatMap(keyword => [
        { title: { contains: keyword, mode: "insensitive" } },
        { agency: { contains: keyword, mode: "insensitive" } },
        { solicitationNumber: { contains: keyword, mode: "insensitive" } },
      ]),
    })
  }

  const raw = await prisma.bid.findMany({
    where: { AND: filters },
    orderBy: { responseDeadline: "asc" },
    take: 100,
  })

  const bids = raw.map(b => ({
    id: b.noticeId,
    title: b.title,
    solicitationNumber: b.solicitationNumber ?? "",
    responseDate: b.responseDeadline?.toISOString() ?? "",
    type: b.bidType ?? "Notice",
    typeCode: "",
    agency: b.agency ?? "Unknown Agency",
    subAgency: "",
    publishDate: b.postedDate?.toISOString() ?? "",
    setAside: b.setAside ?? "",
    uiLink: b.uiLink ?? "",
    naicsCode: b.naicsCode ?? "",
    placeStreet: b.placeStreet ?? "",
    placeCity: b.placeCity ?? "",
    placeState: b.placeState ?? "",
    placeZip: b.placeZip ?? "",
    placeCountry: b.placeCountry ?? "",
    isActive: b.active,
    isDibbs: isDibbsPosting(b.agency, b.title),
  }))

  return NextResponse.json({ category, bids, total: bids.length })
}
