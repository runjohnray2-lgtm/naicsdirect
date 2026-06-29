import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import AccountClient from "@/components/account-client"

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
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              N
            </div>
            <span className="font-bold text-white">NAICS Direct</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Your Account</h1>
        <p className="text-slate-400 mb-10">
          Manage your subscription and billing.
        </p>

        {showSuccess && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-sm text-green-400">
            Welcome to NAICS Direct! Your 14-day free trial has started.
          </div>
        )}

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
                  stripeCurrentPeriodEnd:
                    subscription.stripeCurrentPeriodEnd?.toISOString() ?? null,
                  stripeCustomerId: subscription.stripeCustomerId,
                }
              : null
          }
        />
      </div>
    </div>
  )
}
