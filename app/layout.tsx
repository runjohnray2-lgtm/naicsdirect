import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

const SITE_URL = "https://naicsdirect.com"
const TITLE = "NAICS Direct — Find, Pursue & Manage Federal Contract Opportunities"
const DESCRIPTION =
  "NAICS Direct helps small contractors and suppliers find relevant federal bids, track pursuits and deadlines, research historical awards, source pricing, and prepare quotes in one simple workflow."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | NAICS Direct",
  },
  description: DESCRIPTION,
  keywords: [
    "federal contract opportunities",
    "government bids for small business",
    "SAM.gov alternative",
    "federal bid tracking",
    "government contract deadline tracking",
    "NAICS code bid search",
    "government bid management software",
    "federal contract historical awards",
    "small business government contracting software",
  ],
  applicationName: "NAICS Direct",
  authors: [{ name: "NAICS Direct" }],
  creator: "NAICS Direct",
  publisher: "NAICS Direct",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "NAICS Direct",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#founder`,
        name: "Ray Runyan",
        jobTitle: "Founder",
        worksFor: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "NAICS Direct",
        url: SITE_URL,
        logo: `${SITE_URL}/icon`,
        founder: { "@id": `${SITE_URL}/#founder` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "NAICS Direct",
        description: DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: "NAICS Direct",
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: DESCRIPTION,
        featureList: [
          "Federal opportunity discovery by industry and NAICS code",
          "Watch, pursue, and pass workflow",
          "Government bid pipeline and deal rooms",
          "Deadline and pursuit tracking",
          "Historical federal award research",
          "Supplier sourcing workspace",
          "Internal pricing and customer-facing quote workflow",
        ],
        offers: [
          { "@type": "Offer", name: "Starter", price: "14", priceCurrency: "USD" },
          { "@type": "Offer", name: "Pro", price: "29", priceCurrency: "USD" },
          { "@type": "Offer", name: "Business", price: "49", priceCurrency: "USD" },
        ],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-white antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
