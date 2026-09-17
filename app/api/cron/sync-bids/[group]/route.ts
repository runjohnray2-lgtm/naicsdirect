import { NextResponse } from "next/server"
import { nichesForSyncGroup, syncBidNiches } from "@/lib/sync-bids"

export const maxDuration = 300

export async function GET(
  req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization")
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { group } = await params
  const niches = nichesForSyncGroup(group)
  if (!niches) {
    return NextResponse.json({ error: "Unknown sync group" }, { status: 404 })
  }

  const apiKey = process.env.SAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "SAM_API_KEY not configured" }, { status: 500 })
  }

  const result = await syncBidNiches(niches, apiKey)
  return NextResponse.json({ group, ...result }, { status: result.totalErrors > 0 ? 500 : 200 })
}
