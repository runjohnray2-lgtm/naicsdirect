"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  price: number
  interval: string
  description: string
  features: string[]
  priceId: string
  popular?: boolean
  cta: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function track(event: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params)
  }
}

export default function PricingCard({
  plan,
  isLoggedIn,
  currentPriceId,
}: {
  plan: Plan
  isLoggedIn: boolean
  currentPriceId?: string | null
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isCurrent = Boolean(currentPriceId && currentPriceId === plan.priceId)

  const handleClick = async () => {
    track("select_plan", { plan_id: plan.id, plan_name: plan.name, value: plan.price, currency: "USD" })

    if (isCurrent) {
      router.push("/account")
      return
    }

    if (!isLoggedIn) {
      router.push(`/auth/signin?callbackUrl=/pricing`)
      return
    }

    if (!plan.priceId) {
      alert("Plan not yet configured. Contact support@naicsdirect.com")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      })

      const data = await res.json()
      if (data.url) {
        track("begin_checkout", { plan_id: plan.id, plan_name: plan.name, value: plan.price, currency: "USD" })
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to change plan")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const buttonLabel = isCurrent
    ? "Current Plan"
    : currentPriceId
      ? `Switch to ${plan.name}`
      : plan.cta

  return (
    <div className={`relative bg-slate-900 border rounded-2xl p-8 flex flex-col ${plan.popular ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-slate-800"}`}>
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
          {isCurrent && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Your plan</span>}
        </div>
        <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-slate-500 text-sm">/month</span>
        </div>
        {!currentPriceId && <p className="text-xs text-green-400 mt-1">7-day free trial included</p>}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isCurrent
            ? "bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/15"
            : plan.popular
              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
        }`}
      >
        {loading ? "Updating plan..." : buttonLabel}
      </button>
    </div>
  )
}
