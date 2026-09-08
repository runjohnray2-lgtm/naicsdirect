import type { Metadata } from "next"
import Link from "next/link"

const PAGE_URL = "https://naicsdirect.com/blog/sba-size-standards-2026-federal-contracting"
const SOURCE_URL = "https://federalnewsnetwork.com/contracting/2026/09/the-government-is-changing-some-key-rules-that-shape-the-federal-contracting-marketplace/"

export const metadata: Metadata = {
  title: "2026 SBA Size Standard Proposal: What Federal Contractors Should Watch",
  description:
    "SBA is proposing major changes to small-business size standards. See what could change, why it matters for set-asides, and what contractors should watch before the rule becomes final.",
  keywords: [
    "SBA size standards 2026",
    "small business size standards federal contracting",
    "NAICS size standard changes",
    "federal contracting rule changes 2026",
    "small business set aside eligibility",
    "SBA proposed rule 2026",
  ],
  authors: [{ name: "Ray Runyan" }],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "2026 SBA Size Standard Proposal: What Federal Contractors Should Watch",
    description:
      "A major SBA proposal could change who qualifies as small in federal contracting. Here is what contractors should watch now.",
    url: PAGE_URL,
    type: "article",
  },
}

export default function SbaSizeStandardsRuleWatch() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${PAGE_URL}/#article`,
        headline: "2026 SBA Size Standard Proposal: What Federal Contractors Should Watch",
        description:
          "A plain-English look at SBA's proposed 2026 size-standard changes and what they could mean for small-business federal contractors.",
        url: PAGE_URL,
        datePublished: "2026-09-07",
        dateModified: "2026-09-07",
        author: { "@id": "https://naicsdirect.com/#founder" },
        publisher: { "@id": "https://naicsdirect.com/#organization" },
        isPartOf: { "@id": "https://naicsdirect.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://naicsdirect.com" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://naicsdirect.com/blog" },
          { "@type": "ListItem", position: 3, name: "2026 SBA Size Standard Proposal", item: PAGE_URL },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-400">NAICS Direct</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/blog" className="text-slate-300 hover:text-white">All Guides</Link>
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium">Browse Live Bids</Link>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-sm text-slate-500 mb-5"><Link href="/" className="hover:text-slate-300">Home</Link> / <Link href="/blog" className="hover:text-slate-300">Guides</Link> / Rule Watch</p>

        <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300 mb-5">
          Proposed rule — not final
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">2026 SBA Size Standard Proposal: What Federal Contractors Should Watch</h1>
        <p className="text-xl text-slate-400 mt-6 leading-relaxed">A proposed SBA overhaul could change which companies qualify as “small” for federal contracting. That could reshape set-aside competition, NAICS-based eligibility, and the companies you compete against.</p>
        <div className="mt-6 text-sm text-slate-500">By Ray Runyan · Founder, NAICS Direct · September 7, 2026</div>

        <section className="mt-10 space-y-5 text-slate-300 leading-relaxed">
          <p>Federal News Network reported on September 1 that the Small Business Administration is proposing a major change to the way federal small-business size standards are structured. The proposal would reduce roughly 1,000 NAICS-based industries into 338 broader categories and could substantially raise the revenue threshold for some companies to qualify as small.</p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <p className="font-semibold text-white">Important:</p>
            <p className="mt-2 text-slate-300">This is a proposal, not a final rule. Federal News Network reported that comments are due to SBA on September 21, 2026. Contractors should continue using the current official SBA size standards until any final rule takes effect.</p>
          </div>

          <h2 className="text-2xl font-bold text-white pt-4">Why this matters for small-business set-asides</h2>
          <p>Small-business status determines who can compete for many federal set-aside contracts. If size thresholds rise, companies that are too large under today's standard could become eligible to compete as small businesses in the future.</p>
          <p>That can create opportunity for some mid-sized firms, but it can also increase competition for truly small contractors. A company that used to compete against businesses near its own size could suddenly face firms with far greater staffing, purchasing power, and pricing flexibility.</p>

          <h2 className="text-2xl font-bold text-white pt-4">One example shows how large the change could be</h2>
          <p>Federal News Network cited computer systems and design as an example. Under the current framework discussed in the interview, the small-business threshold was about $34 million in receipts. Under the proposal described there, the threshold could rise to about $531 million.</p>
          <p>That is not a small adjustment. It would materially change who can enter the small-business competitive pool in that category.</p>

          <h2 className="text-2xl font-bold text-white pt-4">NAICS codes still matter — but the eligibility layer may change</h2>
          <p>Contractors already use NAICS codes to find relevant opportunities and understand size standards. If SBA changes the structure behind those standards, simply knowing the NAICS code will not be enough. Contractors will need to know the current standard, any proposed replacement, and whether a change affects their eligibility for a specific set-aside.</p>
          <p>That is exactly the kind of change NAICS Direct is designed to make easier to follow. The goal is not just to show a solicitation. It is to help a contractor understand whether the opportunity is worth pursuing before spending hours on attachments, pricing, and supplier outreach.</p>

          <h2 className="text-2xl font-bold text-white pt-4">DoD is also pushing for deeper supplier cost visibility</h2>
          <p>The same Federal News Network interview covered an August 18 Defense Department memorandum focused on supplier cost and pricing transparency. The discussion described a push for more visibility into cost structures beyond prime contractors and farther down the supply chain.</p>
          <p>For commercial suppliers and subcontractors, that could mean more compliance work and more sensitivity around proprietary cost information. It also reinforces why contractors need to read the full solicitation package and identify pricing-data or disclosure requirements before deciding a bid is ready.</p>

          <h2 className="text-2xl font-bold text-white pt-4">What contractors should do now</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>Keep using the current official SBA size standard until a final rule says otherwise.</li>
            <li>Track the proposal if your business is close to a current size threshold.</li>
            <li>Do not assume a set-aside is open to you just because a proposed rule would make you eligible.</li>
            <li>For DoD work, pay closer attention to cost-data, supplier-disclosure, and subcontractor requirements in the solicitation package.</li>
            <li>Recheck amendments and current eligibility immediately before final submission.</li>
          </ol>

          <h2 className="text-2xl font-bold text-white pt-4">Why NAICS Direct is turning this into a product signal</h2>
          <p>Federal contracting rules change often enough that a static bid list is not enough. NAICS Direct is moving toward a rule-watch layer that can flag material changes affecting eligibility, competition, pricing disclosures, and pursuit risk.</p>
          <p>A future opportunity view should be able to tell a contractor: this is the current size standard, this is a proposed change worth watching, and this solicitation contains compliance language that deserves a closer read. That turns public information into something a small business can actually act on.</p>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="font-semibold text-white">Source</p>
            <p className="mt-2 text-slate-400">This article is based on Federal News Network's September 1, 2026 interview covering SBA's proposed size-standard changes and DoD supplier cost and pricing transparency.</p>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex mt-4 text-indigo-400 hover:text-indigo-300 font-medium">Read the source at Federal News Network →</a>
          </div>
        </section>

        <section className="mt-12 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Find the bid, then know what could change the decision.</h2>
          <p className="text-slate-400 mt-3 mb-6">Browse live federal opportunities and move the promising ones into a pursuit workflow before the deadline gets tight.</p>
          <Link href="/dashboard" className="inline-flex bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 rounded-xl">Browse Live Federal Bids</Link>
        </section>
      </article>
    </div>
  )
}
