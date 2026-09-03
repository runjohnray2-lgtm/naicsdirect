import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About NAICS Direct",
  description:
    "NAICS Direct was built for small businesses that need a simpler way to find, evaluate, and pursue federal contract opportunities without living inside SAM.gov all day.",
  alternates: { canonical: "https://naicsdirect.com/about" },
  openGraph: {
    title: "About NAICS Direct",
    description:
      "Built from the day-to-day reality of a small business searching, sourcing, pricing, and pursuing government opportunities.",
    url: "https://naicsdirect.com/about",
    type: "website",
  },
}

export default function AboutPage() {
  const pageUrl = "https://naicsdirect.com/about"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${pageUrl}/#about`,
    url: pageUrl,
    name: "About NAICS Direct",
    description:
      "NAICS Direct helps small businesses find relevant federal opportunities and move them through a practical pursuit workflow.",
    isPartOf: { "@id": "https://naicsdirect.com/#website" },
    about: { "@id": "https://naicsdirect.com/#organization" },
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-400">NAICS Direct</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/blog" className="text-slate-300 hover:text-white">Guides</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white">Plans</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white">Live Bids</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-sm text-slate-500 mb-5"><Link href="/" className="hover:text-slate-300">Home</Link> / About</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Government contracting tools built for people who still have a business to run.</h1>
        <p className="text-xl text-slate-400 mt-6 leading-relaxed">NAICS Direct was created around a simple problem: a small business can lose hours searching government opportunity systems before it even reaches the real work of deciding whether a contract is worth pursuing.</p>

        <section className="mt-12 space-y-5 text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-white">Why NAICS Direct exists</h2>
          <p>Founder Ray Runyan built NAICS Direct from the perspective of a long-time small-business operator learning the federal contracting process firsthand. The useful question was never just “Can I find a solicitation?” It was “Does this fit my business, what is the deadline, can I source it, what will it cost, and should I spend time pursuing it?”</p>
          <p>That is why NAICS Direct combines live opportunity discovery with industry and NAICS filtering, pursuit decisions, deadline tracking, historical award research, supplier organization, internal pricing, and quote preparation.</p>
          <p>We do not replace SAM.gov. SAM.gov is the official federal system of record. NAICS Direct is designed to make the information easier for a small contractor or supplier to work with.</p>
        </section>

        <section className="mt-12 grid sm:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white">What we optimize for</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">Less time scanning irrelevant notices. Faster go/no-go decisions. Clearer deadlines. Better sourcing and pricing organization. A practical path from discovery to a bid-ready pursuit.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white">Where the data comes from</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">Public federal opportunity data is sourced from official government systems such as SAM.gov and organized into a small-business workflow. Always review the official solicitation and amendments before submitting an offer.</p>
          </div>
        </section>

        <section className="mt-12 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">Start with the opportunities that fit your business</h2>
          <p className="text-slate-400 mt-3 mb-6">Browse current federal opportunities by industry, then decide which ones deserve your time.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl">Browse Live Bids</Link>
            <Link href="/blog" className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-6 py-3 rounded-xl">Read the Guides</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
