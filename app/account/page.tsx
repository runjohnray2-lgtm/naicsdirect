import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import AccountClient from "@/components/account-client"
import CompanyProfile from "@/components/company-profile"
import NicheManager from "@/components/niche-manager"
import NotificationSettings from "@/components/notification-settings"
import CustomCategories from "@/components/custom-categories"
import AppNav from "@/components/app-nav"
import ConversionTracker from "@/components/conversion-tracker"

export const metadata = {
  title: "Account — NAICS Direct",
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; planChanged?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/account")

  const params = await searchParams
  const showSuccess = params.success === "true"
  const showPlanChanged = params.planChanged === "true"

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showSuccess && <ConversionTracker event="trial_start" params={{ source: "stripe_checkout" }} />}
      {showPlanChanged && <ConversionTracker event="plan_change" params={{ source: "pricing" }} />}
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Your Account</h1>
        <p className="text-slate-400 mb-10">Manage your company profile, service, billing, bid alerts, and personal categories.</p>

        {showSuccess && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-sm text-green-400">
            Welcome to NAICS Direct. Complete your federal quote profile, then choose your categories and alert preferences below.
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
              email: session.user.email!,
              name: session.user.name ?? null,
            }}
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
          <CompanyProfile />
          <NotificationSettings />
          <CustomCategories />
          <NicheManager />
        </div>
      </div>
    </div>
  )
}
