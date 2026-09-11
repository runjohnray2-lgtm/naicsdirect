import Link from "next/link"
import type { Metadata } from "next"
import { BLOG_POSTS } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "Federal Contracting Guides | NAICS Direct Blog",
  description:
    "Plain-English federal contracting guides, rule updates, SAM.gov search workflows, and niche-specific resources for small businesses pursuing government work.",
  alternates: {
    canonical: "https://naicsdirect.com/blog",
  },
}

const FEATURED_GUIDES = [
  {
    slug: "sba-size-standards-2026-federal-contracting",
    title: "2026 SBA Size Standard Proposal: What Federal Contractors Should Watch",
    publishedDate: "2026-09-07",
    dek: "A proposed SBA overhaul could change who qualifies as small for federal contracting — reshaping set-aside competition and NAICS-based eligibility.",
  },
  {
    slug: "how-to-search-sam-gov-without-wasting-hours",
    title: "How to Search SAM.gov Without Wasting Hours",
    publishedDate: "2026-09-03",
    dek: "A practical small-business workflow for using NAICS codes, set-asides, deadlines, and go/no-go screening to find federal opportunities worth pursuing.",
  },
]

const NICHE_GUIDES = [
  ["/flooring", "Flooring"],
  ["/janitorial", "Janitorial"],
  ["/hvac", "HVAC"],
  ["/safety", "Safety & PPE"],
  ["/medical", "Medical Supplies"],
  ["/hardware", "Hardware"],
  ["/office-supplies", "Office Supplies"],
  ["/industrial-equipment", "Industrial Equipment"],
  ["/vehicle-parts", "Vehicle Parts"],
  ["/signs-printing", "Signs & Printing"],
  ["/waste-services", "Waste Services"],
  ["/landscaping", "Landscaping"],
]

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  )
  const allPosts = [...FEATURED_GUIDES, ...posts]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "NAICS Direct Blog",
    url: "https://naicsdirect.com/blog",
    description:
      "Federal contracting guidance, rule changes, SAM.gov search workflows, and category-specific resources for small businesses pursuing government work.",
    blogPost: allPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://naicsdirect.com/blog/${p.slug}`,
      datePublished: p.publishedDate,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <nav className="border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-indigo-400">
              NAICS Direct
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                ← Home
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

        <section className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Federal Contracting Guides
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            Practical federal contracting guidance, rule changes, and pursuit workflows for small businesses trying to win real work — not just browse listings. We focus on the decisions that actually affect whether an opportunity is worth pursuing: NAICS fit, set-aside eligibility, deadlines, buying agencies, contract history, and bid-management discipline.
          </p>
          <p className="text-slate-400 max-w-3xl leading-relaxed mt-5">
            The goal of this resource center is not to repeat generic government-contracting advice. Each guide should help you make a better go/no-go decision, understand a current rule change, or move from research into an active pursuit. When you are ready to act, use the <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">live opportunity dashboard</Link> to search and manage current federal opportunities.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-3">Browse federal opportunities by business type</h2>
            <p className="text-slate-400 leading-relaxed mb-5 max-w-3xl">
              These category pages connect contracting guidance to live opportunity discovery. Use them when you want a narrower view of the federal market instead of starting with a broad SAM.gov search.
            </p>
            <div className="flex flex-wrap gap-3">
              {NICHE_GUIDES.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300 hover:border-indigo-500/70 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Latest guides and rule updates</h2>
              <p className="text-slate-400 mt-2">Current guidance with a direct connection to federal opportunity discovery and pursuit decisions.</p>
            </div>
          </div>
          <div className="grid gap-6">
            {allPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 sm:p-8 transition-colors"
              >
                <p className="text-slate-500 text-sm mb-2">
                  {new Date(post.publishedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h3 className="text-2xl font-bold text-white mb-3">{post.title}</h3>
                <p className="text-slate-400 leading-relaxed">{post.dek}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
