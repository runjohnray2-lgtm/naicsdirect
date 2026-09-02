import Link from "next/link"
import { auth } from "@/auth"
import { PLANS } from "@/lib/plans"
import PricingCard from "@/components/pricing-card"

export const metadata = {
  title: "Pricing — NAICS Direct",
  description:
    "Find federal contract opportunities early enough to source, quote, and bid. Daily SAM.gov data, urgency filters, and historical award intelligence.",
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
            3-day free trial on all plans
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Find the Bid Early. Use the Time to Win It.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Government bids take time. Suppliers take time. Subcontractors take
            time. NAICS Direct cuts through thousands of unrelated notices so
            you can find real opportunities sooner and start sourcing before the
            deadline becomes the problem.
          </p>
          <p className="text-sm text-slate-500 mt-5">
            Focused federal opportunity feeds • urgency filtering • historical
            award intelligence
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

        {/* Why it matters */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Built for the Real Bid Timeline
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              The advantage is not seeing more listings. It is finding the right
              opportunity early enough to research pricing, contact suppliers,
              line up subcontractors, and submit a compliant bid.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                title: "Find Earlier",
                desc: "Daily SAM.gov opportunity data organized into focused NAICS niches instead of one giant search result.",
              },
              {
                title: "Research Faster",
                desc: "Use urgency filters and historical federal award intelligence to decide what deserves your time.",
              },
              {
                title: "Build a Pipeline",
                desc: "Track multiple categories so you are not depending on one supplier reply or one government solicitation.",
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

        {/* Trust signals */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            {
              title: "Cancel Anytime",
              desc: "No contracts, no lock-in. Cancel from your account dashboard.",
            },
            {
              title: "3 Days Free",
              desc: "Enter your card now. Cancel before the trial ends and you will not be charged.",
            },
            {
              title: "Real Federal Data",
              desc: "SAM.gov opportunities are refreshed daily. Historical award research uses federal award data.",
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
              a: "Enter your card and get 3 days free. Cancel before the trial ends and you owe nothing.",
            },
            {
              q: "What is a NAICS niche?",
              a: "A focused group of related NAICS codes that turns a broad federal opportunity search into a cleaner feed for the type of work or products you actually pursue.",
            },
            {
              q: "Why does finding a bid early matter?",
              a: "Because a usable quote may require supplier pricing, subcontractor availability, financing checks, compliance research, and time for questions. More lead time gives you more options.",
            },
            {
              q: "What is historical award intelligence?",
              a: "Past federal contract award information can help you research who has won similar work and the historical contract value. Historical totals are context, not a guaranteed future price or unit price.",
            },
            {
              q: "How often is the opportunity data updated?",
              a: "SAM.gov opportunity data is refreshed every morning. Use the urgency filters to separate closing-soon notices from opportunities with enough time to pursue properly.",
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
