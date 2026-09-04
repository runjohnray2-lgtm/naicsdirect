import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"

async function getOrCreatePortalConfiguration() {
  const existing = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 1,
  })

  if (existing.data[0]) return existing.data[0].id

  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your NAICS Direct subscription",
      privacy_policy_url: "https://naicsdirect.com/privacy",
      terms_of_service_url: "https://naicsdirect.com/terms",
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address"],
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "other",
          ],
        },
      },
      invoice_history: {
        enabled: true,
      },
    },
  })

  return configuration.id
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.AUTH_URL ?? "https://naicsdirect.com"
    const configuration = await getOrCreatePortalConfiguration()

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      configuration,
      return_url: `${baseUrl}/account`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Billing portal error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
