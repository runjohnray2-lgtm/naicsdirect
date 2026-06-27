import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { NICHES } from "@/lib/niches"
import { NICHE_SEO } from "@/lib/niche-seo"

interface Props {
  params: Promise<{ niche: string }>
}

export async function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche } = await params
  const seo = NICHE_SEO[niche]
  if (!seo) return { title: "NAICS Direct" }
  return {
    title: seo.title,
    description: seo.metaDescription,
    keywords: seo.keywords.join(", "),
    openGraph: {
      title: seo.h1,
      description: seo.metaDescription,
      url: `https://naicsdirect.com/${niche}`,
      siteName: "NAICS Direct",
      type: "website",
    },
    alternates: {
      canonical: `https://naicsdirect.com/${niche}`,
    },
  }
}

export default async function NicheLandingPage({ params }: Props) {
  const { niche } = await params
  const nicheData = NICHES.find((n) => n.id === niche)
  const seo = NICHE_SEO[niche]

  if (!nicheData || !seo) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.h1,
    description: seo.metaDescription,
    url: `https://naicsdirect.com/${niche}`,
    publisher: {
      "@type": "Organization",
      name: "NAICS Direct",
      url: "https://naicsdirect.com",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Nav */}
        <nav className="border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-indigo-400">
              NAICS Direct
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                ← All Industries
              </Link>
              <Link
                href="/dashboard"
                className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg font-medium transition-colors"
              >
                View Live Bids
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{nicheData.emoji}</span>
            <span
              className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
                nicheData.bgClass
              } ${nicheData.colorClass} ${nicheData.borderClass}`}
            >
              {nicheData.name}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {seo.h1}
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl">{seo.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              View Active {nicheData.name} Bids →
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              See Pricing
            </Link>
          </div>
        </section>

        {/* Intro */}
        <section className="max-w-5xl mx-auto px-6 pb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-300 text-lg leading-relaxed">{seo.intro}</p>
          </div>
        </section>

        {/* NAICS Codes */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            NAICS Codes for {nicheData.name} Contracts
          </h2>
          <div className="grid gap-4">
            {seo.naicsCodes.map(({ code, description }) => (
              <div
                key={code}
                className={`flex items-start gap-4 bg-slate-900 border rounded-xl p-5 ${nicheData.borderClass}`}
              >
                <div
                  className={`text-2xl font-mono font-bold flex-shrink-0 ${nicheData.colorClass}`}
                >
                  {code}
                </div>
                <div>
                  <div className="text-white font-medium">{description}</div>
                  <div className="text-slate-500 text-sm mt-1">
                    Federal solicitations using this NAICS code appear in your NAICS Direct feed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Why {nicheData.name} Contractors Use NAICS Direct
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {seo.benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <div className="text-indigo-400 mt-0.5 flex-shrink-0">✓</div>
                <p className="text-slate-300">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to find your next {nicheData.name.toLowerCase()} contract?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              NAICS Direct is free to use. Browse active {nicheData.name.toLowerCase()} bids right now — no account required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Browse {nicheData.name} Bids Free
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Get Email Alerts — $14/mo
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {seo.faqs.map(({ q, a }, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3">{q}</h3>
                <p className="text-slate-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 px-6 py-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-sm">
              © 2025 NAICS Direct · All federal bid data sourced from SAM.gov
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              {NICHES.filter((n) => n.id !== niche).slice(0, 5).map((n) => (
                <Link key={n.id} href={`/${n.id}`} className="hover:text-slate-300 transition-colors">
                  {n.name}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
