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

export default function PricingCard({
  plan,
  isLoggedIn,
}: {
  plan: Plan
  isLoggedIn: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
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
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to start checkout")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`relative bg-slate-900 border rounded-2xl p-8 flex flex-col ${
        plan.popular
          ? "border-indigo-500 ring-2 ring-indigo-500/30"
          : "border-slate-800"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-slate-500 text-sm">/month</span>
        </div>
        <p className="text-xs text-green-400 mt-1">14-day free trial included</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-green-400 mt-0.5 flex-shrink-0">&#x2713;</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          plan.popular
            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
            : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
        }`}
      >
        {loading ? "Starting checkout..." : plan.cta}
      </button>
    </div>
  )
}
