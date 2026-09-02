import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { nicheLimitForPriceId } from "@/lib/plans"
import type Stripe from "stripe"

function parsePending(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(",").map((v) => v.trim()).filter(Boolean)
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId || !session.subscription) break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const periodEnd = new Date(subscription.current_period_end * 1000)

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: periodEnd,
            nicheLockedUntil: periodEnd,
            status: subscription.status,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: periodEnd,
            nicheLockedUntil: periodEnd,
            status: subscription.status,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        if (!userId) break

        const periodEnd = new Date(subscription.current_period_end * 1000)
        const pending = parsePending(subscription.metadata?.pending_niches)
        const effectiveAt = Number(subscription.metadata?.pending_niches_effective_at || 0)
        const newCycleHasStarted =
          pending.length > 0 &&
          effectiveAt > 0 &&
          subscription.current_period_start >= effectiveAt

        const priceId = subscription.items.data[0].price.id
        const nicheLimit = nicheLimitForPriceId(priceId)
        const selectedForNewCycle = newCycleHasStarted
          ? pending.slice(0, nicheLimit)
          : undefined

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEnd,
            nicheLockedUntil: periodEnd,
            status: subscription.status,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            ...(selectedForNewCycle ? { selectedNiches: selectedForNewCycle } : {}),
          },
        })

        if (newCycleHasStarted) {
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              ...subscription.metadata,
              pending_niches: "",
              pending_niches_effective_at: "",
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        if (!userId) break

        await prisma.subscription.update({
          where: { userId },
          data: { status: "canceled" },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.userId
        if (!userId) break

        await prisma.subscription.update({
          where: { userId },
          data: { status: "past_due" },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
