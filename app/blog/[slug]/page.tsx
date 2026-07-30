import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts"
import { NICHES } from "@/lib/niches"
import { BlogContent } from "@/components/blog-content"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: "NAICS Direct Blog" }
  return {
    title: `${post.title} | NAICS Direct`,
    description: post.metaDescription,
    keywords: post.keywords.join(", "),
    authors: [{ name: "Ray Runyan" }],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://naicsdirect.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedDate,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
    alternates: {
      canonical: `https://naicsdirect.com/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const pageUrl = `https://naicsdirect.com/blog/${post.slug}`
  const relatedNiches = (post.relatedNiches ?? [])
    .map((id) => NICHES.find((n) => n.id === id))
    .filter((n): n is NonNullable<typeof n> => Boolean(n))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}/#article`,
        headline: post.title,
        description: post.metaDescription,
        url: pageUrl,
        datePublished: post.publishedDate,
        dateModified: post.publishedDate,
        author: { "@id": "https://naicsdirect.com/#founder" },
        publisher: { "@id": "https://naicsdirect.com/#organization" },
        isPartOf: { "@id": "https://naicsdirect.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://naicsdirect.com" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://naicsdirect.com/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: pageUrl },
        ],
      },
    ],
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
              <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                ← All Guides
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

        <div className="max-w-3xl mx-auto px-6 pt-6">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-300 truncate max-w-xs" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>
        </div>

        <article className="max-w-3xl mx-auto px-6 pt-8 pb-24">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-slate-400 mb-6">{post.dek}</p>

          <div className="flex items-center gap-3 pb-8 mb-8 border-b border-slate-800">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              RR
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">Ray Runyan</p>
              <p className="text-slate-500">
                Founder, NAICS Direct ·{" "}
                {new Date(post.publishedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <BlogContent blocks={post.content} />

          {relatedNiches.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Related</h2>
              <div className="flex flex-wrap gap-3">
                {relatedNiches.map((n) => (
                  <Link
                    key={n.id}
                    href={`/${n.id}`}
                    className="text-sm bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg px-4 py-2 transition-colors"
                  >
                    {n.emoji} {n.name} Contracts →
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              See live federal bids in your exact industry
            </h2>
            <p className="text-slate-400 mb-6">
              NAICS Direct filters SAM.gov to your NAICS codes. Free to browse, no signup required.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Browse Live Bids Free
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}
