import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

const SITE_URL = "https://naicsdirect.com"
const TITLE = "NAICS Direct — Federal Bids Filtered For Your Industry"
const DESCRIPTION =
  "Stop paying $500/month for bids you don't need. NAICS Direct shows only contracts in your exact industry. Real SAM.gov data, synced daily. Starting at $14/month."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | NAICS Direct",
  },
  description: DESCRIPTION,
  keywords: [
    "federal contract bids",
    "SAM.gov filtered by industry",
    "NAICS code bid search",
    "government contracts for small business",
    "federal bid opportunities by NAICS",
  ],
  applicationName: "NAICS Direct",
  authors: [{ name: "NAICS Direct" }],
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
  alternates: {
    canonical: SITE_URL,
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "NAICS Direct",
        url: SITE_URL,
        logo: `${SITE_URL}/icon`,
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
        name: "NAICS Direct",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "14",
          priceCurrency: "USD",
          priceValidUntil: "2027-12-31",
        },
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-slate-950 text-white antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
