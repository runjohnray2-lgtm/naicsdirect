import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isDibbsPosting } from "@/lib/dibbs"
import { getPaidPursuitUserId } from "@/lib/pursuit-access"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPaidPursuitUserId()
  if (!access.authenticated || !access.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!access.entitled) {
    return NextResponse.json({ error: "Start a plan to use personal bid feeds." }, { status: 403 })
  }
  const { id } = await params

  const category = await prisma.customCategory.findFirst({ where: { id, userId: access.userId } })
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 })

  const filters: Record<string, unknown>[] = [{ active: true }]
  if (category.naicsCodes.length) filters.push({ naicsCode: { in: category.naicsCodes } })
  if (category.states.length) filters.push({ placeState: { in: category.states, mode: "insensitive" } })
  if (category.agencies.length) {
    filters.push({ OR: category.agencies.map(agency => ({ agency: { contains: agency, mode: "insensitive" } })) })
  }
  if (category.setAsides.length) {
    filters.push({ OR: category.setAsides.map(setAside => ({ setAside: { contains: setAside, mode: "insensitive" } })) })
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
  if (category.excludedKeywords.length) {
    filters.push({
      NOT: {
        OR: category.excludedKeywords.flatMap(keyword => [
          { title: { contains: keyword, mode: "insensitive" } },
          { agency: { contains: keyword, mode: "insensitive" } },
          { solicitationNumber: { contains: keyword, mode: "insensitive" } },
        ]),
      },
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
