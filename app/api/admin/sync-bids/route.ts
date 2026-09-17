import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { nichesForSyncGroup, syncBidNiches } from "@/lib/sync-bids"

const ADMIN_EMAILS = new Set(["agent@radiantz.com", "ray@radiantz.com"])

export const maxDuration = 300

export async function GET(req: Request) {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (!email || !ADMIN_EMAILS.has(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const group = url.searchParams.get("group") || ""
  const niches = nichesForSyncGroup(group)
  if (!niches) {
    return NextResponse.json({ error: "Invalid sync group" }, { status: 400 })
  }

  const apiKey = process.env.SAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "SAM_API_KEY not configured" }, { status: 500 })
  }

  const result = await syncBidNiches(niches, apiKey)
  return NextResponse.json({ group, ...result }, { status: result.success ? 200 : 502 })
}
