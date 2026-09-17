import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"

async function getOrCreatePortalConfiguration() {
  const existing = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 100,
  })

  const compatible = existing.data.find((configuration) =>
    configuration.features.payment_method_update.enabled &&
    configuration.features.invoice_history.enabled &&
    configuration.features.subscription_cancel.enabled &&
    configuration.features.subscription_cancel.mode === "at_period_end"
  )

  if (compatible) return compatible.id

  const configuration = await stripe.billingPortal.configurations.create(
    {
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
    },
    { idempotencyKey: "naics-direct-customer-portal-v2" }
  )

  return configuration.id
}

export async function POST() {
  try {
    const session = await auth()
    const sessionEmail = session?.user?.email?.toLowerCase() ?? null

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

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
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
    return NextResponse.json(
      { error: "Unable to open billing. Please try again." },
      { status: 500 }
    )
  }
}
