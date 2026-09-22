import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"
import Link from "next/link"
import AccountClient from "@/components/account-client"
import AppNav from "@/components/app-nav"
import ConversionTracker from "@/components/conversion-tracker"
import CheckoutStatus from "@/components/checkout-status"

export const metadata = {
  title: "Account — NAICS Direct",
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; planChanged?: string; session_id?: string }>
}) {
  const session = await auth()
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null
  if (!sessionEmail) redirect("/auth/signin?callbackUrl=/account")

  let userId = session?.user?.id ?? null
  if (!userId) {
    const user = await prisma.user.findUnique({
      where: { email: sessionEmail },
      select: { id: true },
    })
    userId = user?.id ?? null
  }

  if (!userId) redirect("/auth/signin?callbackUrl=/account")

  const params = await searchParams
  const returnedFromCheckout = params.success === "true"
  const showPlanChanged = params.planChanged === "true"

  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  let checkoutSubscriptionId: string | null = null
  if (returnedFromCheckout && params.session_id?.startsWith("cs_")) {
    try {
      const checkout = await stripe.checkout.sessions.retrieve(params.session_id)
      if (checkout.status === "complete" && checkout.metadata?.userId === userId) {
        checkoutSubscriptionId = typeof checkout.subscription === "string"
          ? checkout.subscription
          : checkout.subscription?.id ?? null

        if (checkoutSubscriptionId && subscription?.stripeSubscriptionId !== checkoutSubscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(checkoutSubscriptionId)
          const legacy = stripeSubscription as typeof stripeSubscription & { current_period_end?: number }
          const firstItem = stripeSubscription.items.data[0] as typeof stripeSubscription.items.data[0] & { current_period_end?: number }
          const periodEndUnix = legacy.current_period_end ?? firstItem?.current_period_end
          if (!periodEndUnix) throw new Error("Stripe subscription period is missing")
          const periodEnd = new Date(periodEndUnix * 1000)

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id ?? "",
              stripeSubscriptionId: stripeSubscription.id,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: periodEnd,
              nicheLockedUntil: periodEnd,
              status: stripeSubscription.status,
              trialEnd: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
            },
            update: {
              stripeCustomerId: typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id ?? subscription?.stripeCustomerId ?? "",
              stripeSubscriptionId: stripeSubscription.id,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: periodEnd,
              nicheLockedUntil: periodEnd,
              status: stripeSubscription.status,
              trialEnd: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
            },
          })

          subscription = await prisma.subscription.findUnique({
            where: { userId },
          })
        }
      }
    } catch (error) {
      console.error("Could not verify checkout return", error)
    }
  }

  const hasAccess = subscription?.status === "trialing" || subscription?.status === "active"

  const showSuccess = Boolean(
    checkoutSubscriptionId &&
    checkoutSubscriptionId === subscription?.stripeSubscriptionId &&
    hasAccess
  )

  const trialDaysRemaining =
    subscription?.status === "trialing" && subscription.trialEnd
      ? Math.max(
          0,
          Math.ceil(
            (subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        )
      : null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showSuccess && <ConversionTracker event="trial_start" params={{ source: "stripe_checkout" }} />}
      {showPlanChanged && <ConversionTracker event="plan_change" params={{ source: "pricing" }} />}
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Your Account</h1>
        <p className="text-slate-400 mb-10">Manage your sign-in, plan, billing, and subscription.</p>

        {returnedFromCheckout && !showSuccess && (
          <CheckoutStatus verified={Boolean(checkoutSubscriptionId)} />
        )}

        {showSuccess && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-sm text-green-400">
            Welcome to NAICS Direct. Choose your categories below, then open your bid feed. You can add your company profile when you are ready to build a quote.
          </div>
        )}
        {showPlanChanged && (
          <div className="mb-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-6 py-4 text-sm text-indigo-300">
            Your plan change was saved. Stripe will apply any applicable proration automatically.
          </div>
        )}

        <div className="space-y-6">
          <AccountClient
            user={{
              email: sessionEmail,
              name: session?.user?.name ?? null,
            }}
            trialDaysRemaining={trialDaysRemaining}
            subscription={
              subscription
                ? {
                    status: subscription.status,
                    stripePriceId: subscription.stripePriceId,
                    trialEnd: subscription.trialEnd?.toISOString() ?? null,
                    stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd?.toISOString() ?? null,
                    stripeCustomerId: subscription.stripeCustomerId,
                  }
                : null
            }
          />
          {hasAccess ? (
            <section className="grid sm:grid-cols-2 gap-4">
              <Link href="/categories" className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-colors">
                <p className="text-white font-semibold">Categories & Alerts</p>
                <p className="text-sm text-slate-500 mt-1">Choose your plan categories, build personal feeds, and manage bid alerts.</p>
              </Link>
              <Link href="/quote-profile" className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-colors">
                <p className="text-white font-semibold">Federal Quote Profile</p>
                <p className="text-sm text-slate-500 mt-1">Set the company information that NAICS Direct inserts into quote drafts.</p>
              </Link>
            </section>
          ) : (
            <section className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-center">
              <h2 className="text-white font-semibold">Subscriber tools unlock with your trial</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                Start a plan to choose bid categories, receive alerts, and use pursuit, supplier, pricing, and quote-building tools.
              </p>
              <Link href="/pricing" className="inline-block mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                Start 7-Day Free Trial
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
