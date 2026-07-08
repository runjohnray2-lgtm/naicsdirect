import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { NICHES } from "@/lib/niches"

// One-time (and safe to re-run) maintenance route: before the ncode/naicsCode
// param fix, every niche's sync pulled unfiltered nationwide SAM.gov results,
// so many bids got tagged to a niche whose registered NAICS list doesn't
// actually include that bid's naicsCode. This deactivates those leftovers so
// they stop showing up until a correct future sync (or their own deadline)
// naturally handles them.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const summary: Record<string, number> = {}
  let totalDeactivated = 0

  for (const niche of NICHES) {
    const result = await prisma.bid.updateMany({
      where: {
        niche: niche.id,
        active: true,
        naicsCode: { notIn: niche.naicsCodes },
      },
      data: { active: false },
    })
    summary[niche.id] = result.count
    totalDeactivated += result.count
  }

  return NextResponse.json({
    success: true,
    totalDeactivated,
    summary,
    ranAt: new Date().toISOString(),
  })
}
