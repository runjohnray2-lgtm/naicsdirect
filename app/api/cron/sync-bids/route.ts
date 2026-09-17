import { NextResponse } from "next/server"
import { SYNC_GROUPS } from "@/lib/sync-bids"

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization")
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(
    {
      error: "The full sync was retired because it could exceed the function runtime. Use a grouped sync route.",
      groups: Object.keys(SYNC_GROUPS),
    },
    { status: 410 }
  )
}
