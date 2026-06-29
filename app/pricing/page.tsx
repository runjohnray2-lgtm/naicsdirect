import Link from "next/link"
import { auth } from "@/auth"
import { PLANS } from "@/lib/plans"
import PricingCard from "@/components/pricing-card"

export const metadata = {
  title: "Pricing — NAICS Direct",
  description:
    "Start with a 14-day free trial. Real SAM.gov data filtered to your exact NAICS code.",
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>
}) {
  const session = await auth()
  const params = await searchParams
  const showCanceled = params.canceled === "true"

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
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/account"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/dashboard"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {showCanceled && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-400">
              Checkout was canceled. No charge was made.
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-sm text-green-400 mb-6">
            14-day free trial on all plans
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Stop scrolling thousands of contracts that have nothing to do with
            your business. Start your free trial — card required, charged after
            14 days.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={{ ...plan, features: [...plan.features] }}
              isLoggedIn={!!session}
            />
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: "lock",
              title: "Cancel Anytime",
              desc: "No contracts, no lock-in. Cancel from your account dashboard instantly.",
            },
            {
              icon: "card",
              title: "Card Required After Trial",
              desc: "Enter card now — you won't be charged for 14 days.",
            },
            {
              icon: "data",
              title: "Real SAM.gov Data",
              desc: "Pulled directly from federal procurement systems and refreshed daily.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Common Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "How does the free trial work?",
              a: "Enter your card and get 14 days free. Cancel before the trial ends and you owe nothing.",
            },
            {
              q: "What is a NAICS niche?",
              a: "A curated cluster of related NAICS codes — for example, all flooring contracts (NAICS 238330, 442210, 314110) bundled into one clean alert feed.",
            },
            {
              q: "How often is the data updated?",
              a: "SAM.gov data is refreshed daily. Pro and Business subscribers get real-time alerts when new solicitations post.",
            },
            {
              q: "Can I change plans?",
              a: "Yes. Upgrade or downgrade anytime from your account page. Stripe handles proration automatically.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <p className="text-sm font-semibold text-white mb-2">{faq.q}</p>
              <p className="text-sm text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-bold">
              N
            </div>
            <span className="text-sm text-slate-400">NAICS Direct</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-slate-300 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/contact"
              className="hover:text-slate-300 transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 NAICS Direct. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
