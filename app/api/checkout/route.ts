import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
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

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 3,
      metadata: { userId },
    },
    success_url: `${process.env.NEXTAUTH_URL}/account?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: { userId },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
