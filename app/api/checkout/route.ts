import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId } = await req.json()
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    const userId = session.user.id
    const email = session.user.email ?? undefined

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined

    const existing = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    })

    if (existing?.stripeCustomerId) {
      stripeCustomerId = existing.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      })
      stripeCustomerId = customer.id
    }

    // AUTH_URL is the Auth.js v5 env var this project actually sets (see auth.config.ts).
    // NEXTAUTH_URL is the old v4 name and was never configured here - using it silently
    // produced "undefined/account?success=true" as the Stripe redirect URL, which Stripe
    // rejects, crashing this route with no error handling. Fixed both issues below.
    const baseUrl = process.env.AUTH_URL ?? "https://naicsdirect.com"

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 3,
        metadata: { userId },
      },
      success_url: `${baseUrl}/account?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: { userId },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout API error:", error)
    const message = error instanceof Error ? error.message : "Failed to start checkout"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
