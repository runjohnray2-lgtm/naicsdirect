import Link from "next/link"
import type { Metadata } from "next"
import { BLOG_POSTS } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "Federal Contracting Guides | NAICS Direct Blog",
  description:
    "Plain-English guides to SAM.gov, DIBBS, and federal contracting for small businesses — written by a small business that actually bids on these contracts.",
  alternates: {
    canonical: "https://naicsdirect.com/blog",
  },
}

const FEATURED_GUIDES = [
  {
    slug: "how-to-search-sam-gov-without-wasting-hours",
    title: "How to Search SAM.gov Without Wasting Hours",
    publishedDate: "2026-09-03",
    dek: "A practical small-business workflow for using NAICS codes, set-asides, deadlines, and go/no-go screening to find federal opportunities worth pursuing.",
  },
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
          <p className="text-xl text-slate-400 max-w-2xl">
            Plain-English guides to SAM.gov, DIBBS, and federal contracting — written from the perspective of a small business doing the work, not a generic content farm.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
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
                <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
                <p className="text-slate-400 leading-relaxed">{post.dek}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
