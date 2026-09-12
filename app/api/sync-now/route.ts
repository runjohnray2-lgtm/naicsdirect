import { NextResponse } from "next/server"
import { auth } from "@/auth"

export const maxDuration = 300
export const dynamic = "force-dynamic"

function isAdmin(email: string | null | undefined) {
  if (!email) return false
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
  return new Set([...configured, "agent@radiantz.com", "ray@radiantz.com", "sales@radiantz.com"]).has(email.toLowerCase())
}

export async function GET() {
  const session = await auth()
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Manual sync is not configured" }, { status: 503 })
  }

  const baseUrl = process.env.AUTH_URL || "https://naicsdirect.com"
  const response = await fetch(`${baseUrl}/api/cron/sync-bids`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  })
  const body = await response.json().catch(() => ({ error: "Bid sync returned an unreadable response" }))
  return NextResponse.json(body, { status: response.status })
}
