import { MetadataRoute } from "next"
import { PUBLIC_NICHES } from "@/lib/niches"
import { BLOG_POSTS } from "@/lib/blog-posts"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://naicsdirect.com"
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]

  const nicheRoutes: MetadataRoute.Sitemap = PUBLIC_NICHES.map((n) => ({
    url: `${base}/${n.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...BLOG_POSTS.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.publishedDate),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]

  return [...staticRoutes, ...nicheRoutes, ...blogRoutes]
}
