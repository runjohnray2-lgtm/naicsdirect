import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { PLANS } from "@/lib/plans"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const sessionEmail = session?.user?.email?.toLowerCase() ?? null

    // Some older JWT sessions were issued before the user id was copied into the token.
    // They are still valid authenticated sessions, so recover the database user by email.
    let userId = session?.user?.id ?? null
    if (!userId && sessionEmail) {
      const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true },
      })
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId } = await req.json()
    if (!priceId || !PLANS.some((plan) => plan.priceId === priceId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const email = sessionEmail ?? undefined

    const existing = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (
      existing?.stripeSubscriptionId &&
      (existing.status === "active" || existing.status === "trialing")
    ) {
      if (existing.stripePriceId === priceId) {
        return NextResponse.json({ url: "/account", unchanged: true })
      }

      const current = await stripe.subscriptions.retrieve(existing.stripeSubscriptionId)
      const item = current.items.data[0]
      if (!item) {
        return NextResponse.json({ error: "Subscription has no billable item" }, { status: 409 })
      }

      const updated = await stripe.subscriptions.update(existing.stripeSubscriptionId, {
        items: [{ id: item.id, price: priceId }],
        proration_behavior: "create_prorations",
      })

      await prisma.subscription.update({
        where: { userId },
        data: {
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(updated.current_period_end * 1000),
          nicheLockedUntil: new Date(updated.current_period_end * 1000),
        },
      })

      return NextResponse.json({ url: "/account?planChanged=true", changed: true })
    }

    let stripeCustomerId: string
    if (existing?.stripeCustomerId) {
      stripeCustomerId = existing.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      })
      stripeCustomerId = customer.id
    }

    const baseUrl = process.env.AUTH_URL ?? "https://naicsdirect.com"

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
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
