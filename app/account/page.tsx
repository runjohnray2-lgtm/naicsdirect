import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import AccountClient from "@/components/account-client"
import NicheManager from "@/components/niche-manager"
import NotificationSettings from "@/components/notification-settings"
import CustomCategories from "@/components/custom-categories"
import AppNav from "@/components/app-nav"

export const metadata = {
  title: "Account — NAICS Direct",
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/account")

  const params = await searchParams
  const showSuccess = params.success === "true"

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Your Account</h1>
        <p className="text-slate-400 mb-10">Manage your service, billing, bid alerts, and personal categories.</p>

        {showSuccess && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-sm text-green-400">
            Welcome to NAICS Direct. Choose your categories and alert preferences below to start building your bid feed.
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
          <NotificationSettings />
          <CustomCategories />
          <NicheManager />
        </div>
      </div>
    </div>
  )
}
