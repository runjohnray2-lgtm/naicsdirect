import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { PLANS } from "@/lib/plans"

const ADMIN_EMAILS = new Set(["agent@radiantz.com", "ray@radiantz.com"])

export async function GET() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (!email || !ADMIN_EMAILS.has(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const key = process.env.STRIPE_SECRET_KEY ?? ""
  const keyMode = key.startsWith("sk_live_") ? "live" : key.startsWith("sk_test_") ? "test" : key ? "unknown" : "missing"

  const prices = []
  for (const plan of PLANS) {
    try {
      const price = await stripe.prices.retrieve(plan.priceId)
      prices.push({
        plan: plan.name,
        found: true,
        active: price.active,
        livemode: price.livemode,
        amount: price.unit_amount,
        currency: price.currency,
      })
    } catch (error) {
      prices.push({ plan: plan.name, found: false, errorType: error instanceof Error ? error.name : "UnknownError" })
    }
  }

  return NextResponse.json({ keyMode, prices })
}
