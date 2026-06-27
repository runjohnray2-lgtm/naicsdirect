import { MetadataRoute } from "next"
import { NICHES } from "@/lib/niches"

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
      url: `${base}/dashboard`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ]

  const nicheRoutes: MetadataRoute.Sitemap = NICHES.map((n) => ({
    url: `${base}/${n.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...nicheRoutes]
}
