"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { PLANS } from "@/lib/plans"

interface Subscription {
  status: string
  stripePriceId: string | null
  trialEnd: string | null
  stripeCurrentPeriodEnd: string | null
  stripeCustomerId: string
}

const STATUS_COLORS: Record<string, string> = {
  trialing: "text-green-400 bg-green-500/10 border-green-500/20",
  active: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  past_due: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  canceled: "text-red-400 bg-red-500/10 border-red-500/20",
  incomplete: "text-amber-400 bg-amber-500/10 border-amber-500/20",
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  incomplete: "Incomplete",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function AccountClient({
  user,
  subscription,
}: {
  user: { email: string; name: string | null }
  subscription: Subscription | null
}) {
  const [portalLoading, setPortalLoading] = useState(false)

  const currentPlan = PLANS.find((p) => p.priceId === subscription?.stripePriceId)

  const handleBillingPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-600/30 rounded-full flex items-center justify-center text-lg font-bold text-indigo-400">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            {user.name && <p className="text-white font-medium">{user.name}</p>}
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Subscription
        </h2>

        {!subscription ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-4">
              You don&apos;t have an active subscription.
            </p>
            <Link
              href="/pricing"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">
                  {currentPlan?.name ?? "NAICS Direct"}
                </p>
                <p className="text-slate-500 text-sm">
                  ${currentPlan?.price ?? "—"}/month
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  STATUS_COLORS[subscription.status] ??
                  "text-slate-400 bg-slate-800 border-slate-700"
                }`}
              >
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </span>
            </div>

            {subscription.status === "trialing" && subscription.trialEnd && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-3 text-sm text-green-400">
                Trial ends {formatDate(subscription.trialEnd)}
              </div>
            )}

            {subscription.status === "active" &&
              subscription.stripeCurrentPeriodEnd && (
                <p className="text-xs text-slate-500">
                  Next billing date:{" "}
                  {formatDate(subscription.stripeCurrentPeriodEnd)}
                </p>
              )}

            {subscription.status === "past_due" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-400">
                Your payment is past due. Update your payment method to keep
                access.
              </div>
            )}

            <button
              onClick={handleBillingPortal}
              disabled={portalLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? "Loading..." : "Manage Billing & Payment Method"}
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Session
        </h2>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
