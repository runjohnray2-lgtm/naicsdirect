import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { NICHES, PUBLIC_NICHES } from "@/lib/niches"
import { NICHE_SEO } from "@/lib/niche-seo"
import { EXTRA_NICHE_SEO } from "@/lib/niche-seo-extra"
import { prisma } from "@/lib/db"

export const revalidate = 3600

interface Props { params: Promise<{ niche: string }> }

function getNicheSEO(niche: string) {
  return NICHE_SEO[niche] ?? EXTRA_NICHE_SEO[niche]
}

export async function generateStaticParams() {
  return PUBLIC_NICHES.map((n) => ({ niche: n.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche } = await params
  const seo = getNicheSEO(niche)
  const nicheData = NICHES.find((n) => n.id === niche)
  if (!seo || !nicheData) return { title: "NAICS Direct" }
  const description = `${seo.metaDescription} Track pursuits, deadlines, historical awards, sourcing, pricing, and quotes with NAICS Direct.`
  return {
    title: seo.title,
    description,
    keywords: [...seo.keywords, "government bid tracking", "federal contract deadlines", "SAM.gov alternative"].join(", "),
    openGraph: { title: seo.h1, description, url: `https://naicsdirect.com/${niche}`, siteName: "NAICS Direct", type: "website" },
    twitter: { card: "summary_large_image", title: seo.h1, description },
    alternates: { canonical: `https://naicsdirect.com/${niche}` },
  }
}

export default async function NicheLandingPage({ params }: Props) {
  const { niche } = await params
  const nicheData = NICHES.find((n) => n.id === niche)
  const seo = getNicheSEO(niche)
  if (!nicheData || !seo) notFound()

  const pageUrl = `https://naicsdirect.com/${niche}`
  let activeBids: Array<{ title: string; agency: string | null; responseDeadline: Date | null; setAside: string | null }> = []
  let activeCount = 0
  let dateModified: string | undefined

  try {
    const where = { niche: nicheData.id, active: true }
    const [rows, count, lastSynced] = await Promise.all([
      prisma.bid.findMany({ where, orderBy: { responseDeadline: "asc" }, take: 3, select: { title: true, agency: true, responseDeadline: true, setAside: true } }),
      prisma.bid.count({ where }),
      prisma.bid.findFirst({ where, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    ])
    activeBids = rows
    activeCount = count
    dateModified = lastSynced?.updatedAt?.toISOString()
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        name: seo.h1,
        description: seo.metaDescription,
        url: pageUrl,
        ...(dateModified ? { dateModified } : {}),
        isPartOf: { "@id": "https://naicsdirect.com/#website" },
        publisher: { "@id": "https://naicsdirect.com/#organization" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://naicsdirect.com" },
          { "@type": "ListItem", position: 2, name: nicheData.name, item: pageUrl },
        ],
      },
      ...(activeBids.length ? [{
        "@type": "ItemList",
        name: `Current ${nicheData.name} federal contract opportunities`,
        numberOfItems: activeBids.length,
        itemListElement: activeBids.map((bid, index) => ({ "@type": "ListItem", position: index + 1, name: bid.title })),
      }] : []),
    ],
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-400">NAICS Direct</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-300 hover:text-white">Bid Feed</Link>
            <Link href="/pursuits" className="text-slate-300 hover:text-white">My Pursuits</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white">Plans</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-14">
          <p className="text-sm text-slate-500 mb-5"><Link href="/" className="hover:text-slate-300">Home</Link> / {nicheData.name}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">{seo.h1}</h1>
          <p className="text-xl text-slate-400 mb-5 max-w-3xl">{seo.subtitle}</p>
          <p className="text-slate-300 max-w-3xl leading-relaxed">Find relevant federal opportunities, then move them into a pursuit workspace to track deadlines, research historical awards, organize suppliers, build internal pricing, and prepare a clean customer-facing quote.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href={`/dashboard?niche=${nicheData.id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl">View Live {nicheData.name} Bids</Link>
            <Link href="/pricing" className="border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold px-6 py-3 rounded-xl">See Plans</Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-14">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div><h2 className="text-2xl font-bold text-white">Current {nicheData.name} Opportunities</h2><p className="text-slate-500 text-sm mt-1">Server-rendered from the NAICS Direct federal bid database.</p></div>
              <div className="text-indigo-300 font-semibold">{activeCount} active</div>
            </div>
            {activeBids.length ? <div className="space-y-3">{activeBids.map((bid, index) => (
              <div key={`${bid.title}-${index}`} className="border border-slate-800 rounded-xl p-4 bg-slate-950/60">
                <h3 className="text-white font-medium">{bid.title}</h3>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 mt-2">
                  <span>{bid.agency || "Federal agency"}</span>
                  {bid.setAside && <span>{bid.setAside}</span>}
                  {bid.responseDeadline && <span>Due {bid.responseDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                </div>
              </div>
            ))}</div> : <p className="text-slate-500">No active opportunities are currently indexed for this category. The feed updates as new federal notices are synced.</p>}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-14">
          <h2 className="text-2xl font-bold text-white mb-6">From Bid Discovery to Submission Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Find & Filter", "See federal opportunities matched to your industry and NAICS codes."],
              ["Pursue / Watch / Pass", "Move promising bids into a personal pipeline instead of re-evaluating them every visit."],
              ["Track Deadlines", "Keep response, question, and supplier-quote deadlines attached to the pursuit."],
              ["Research Awards", "Use historical federal award data for context on similar work and past contract values."],
              ["Source & Price", "Organize supplier candidates, quote status, internal costs, margin, and recommended selling price."],
              ["Prepare the Quote", "Build a customer-facing quote separately from internal supplier costs and margin data."],
            ].map(([title, body]) => <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-5"><h3 className="text-white font-semibold">{title}</h3><p className="text-slate-400 text-sm mt-2 leading-relaxed">{body}</p></div>)}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-14">
          <h2 className="text-2xl font-bold text-white mb-6">NAICS Codes for {nicheData.name} Contracts</h2>
          <div className="grid gap-4">{seo.naicsCodes.map(({ code, description }) => <div key={code} className="flex items-start gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5"><div className="text-2xl font-mono font-bold text-indigo-400">{code}</div><div><div className="text-white font-medium">{description}</div><div className="text-slate-500 text-sm mt-1">Federal solicitations using this NAICS code can appear in this feed.</div></div></div>)}</div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Why {nicheData.name} Contractors Use NAICS Direct</h2>
          <div className="grid sm:grid-cols-2 gap-4">{seo.benefits.map((benefit, i) => <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-300">✓ {benefit}</div>)}</div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">{seo.faqs.map(({ q, a }, i) => <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6"><h3 className="text-white font-semibold mb-3">{q}</h3><p className="text-slate-400 leading-relaxed">{a}</p></div>)}</div>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-6 py-8"><div className="max-w-5xl mx-auto text-sm text-slate-500">© 2026 NAICS Direct · Federal opportunity data sourced from SAM.gov</div></footer>
    </div>
  )
}
