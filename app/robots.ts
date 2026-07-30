import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/auth/",
          "/dashboard/bids",
          "/radiantz-bids",
        ],
      },
    ],
    sitemap: "https://naicsdirect.com/sitemap.xml",
  }
}
