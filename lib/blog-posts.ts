export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string }

export interface BlogPost {
  slug: string
  title: string
  metaDescription: string
  keywords: string[]
  publishedDate: string // ISO date
  dek: string // one-line subhead shown under the H1
  relatedNiches?: string[] // niche ids this post links to
  content: BlogBlock[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "dibbs-explained-plain-english-guide",
    title: "DIBBS Explained: A Plain-English Guide for First-Time Bidders",
    metaDescription:
      "DIBBS (DLA Internet Bid Board System) has almost no beginner documentation. Here's how RFQs, CAGE codes, quote submission, and awards actually work, written by someone who bids on it.",
    keywords: [
      "DIBBS explained",
      "how does DIBBS work",
      "DLA Internet Bid Board System guide",
      "how to bid on DIBBS",
      "DIBBS RFQ tutorial",
      "CAGE code DIBBS",
    ],
    publishedDate: "2026-07-31",
    dek: "The Defense Logistics Agency's bid system moves billions of dollars a year through small businesses — and has almost no beginner-friendly documentation. Here's how it actually works.",
    relatedNiches: ["safety", "automotive", "hvac"],
    content: [
      {
        type: "p",
        text: "If you've ever landed on DIBBS.bsm.dla.mil for the first time, you know the feeling: a dense, government-issue interface, acronyms with no glossary, and a login wall before you can see anything useful. DIBBS (the DLA Internet Bid Board System) is where the Defense Logistics Agency posts Requests For Quote (RFQs) for parts and supplies — everything from lighting fixtures to lamp assemblies to tactical gear. It moves real money, and small businesses win real contracts through it every day. But almost nobody explains it in plain English. This guide does.",
      },
      { type: "h2", text: "What DIBBS actually is" },
      {
        type: "p",
        text: "DIBBS is DLA's public bid board for procuring parts and supplies under the National Stock Number (NSN) system — the catalog the entire U.S. military uses to identify every part, from a lightbulb to a helicopter rotor. When a DLA depot needs to restock an item, it posts a solicitation on DIBBS. Vendors — including small businesses — submit quotes. DLA awards to the lowest-priced, technically acceptable, responsible offeror (usually; some solicitations are set aside for specific business categories, more on that below).",
      },
      {
        type: "p",
        text: "It is not a general contracting portal like SAM.gov. SAM.gov is where nearly all federal contract opportunities across every agency get posted — DIBBS is DLA-specific, and it's built around NSN-based supply items rather than services or large construction projects.",
      },
      { type: "h2", text: "The vocabulary you need before anything makes sense" },
      {
        type: "ul",
        items: [
          "**CAGE Code** — Commercial and Government Entity code. A unique 5-character ID assigned to your business through SAM.gov registration. You cannot quote on DIBBS without one.",
          "**NSN** — National Stock Number. The 13-digit code (format: 1234-01-234-5678) identifying the exact part being procured. One NSN can have multiple approved manufacturers/part numbers.",
          "**RFQ** — Request For Quote. The solicitation itself — a document with quantity, delivery requirements, packaging instructions, and (sometimes) historical pricing.",
          "**Solicitation Number** — The unique ID for that specific RFQ (format like SPE4A6-26-T-0912). Every RFQ has one; it's how you look it up.",
          "**FOB Point** — Freight On Board point. Determines who pays shipping and when ownership transfers. Read the actual solicitation text — don't guess from boilerplate. FOB Origin generally means the government arranges pickup; FOB Destination means you're responsible for delivery.",
          "**Approved Source** — DLA restricts many NSNs to specific manufacturers/CAGE codes that have proven they can meet spec. If you're not the approved source, you generally need to be an authorized dealer/distributor or get source approval.",
        ],
      },
      { type: "h2", text: "How the actual bid lifecycle works" },
      {
        type: "ol",
        items: [
          "**A buyer posts an RFQ.** It includes the NSN, quantity, delivery timeline, and packaging/inspection requirements. If your CAGE is a known supplier for that NSN or matches DLA's buyer-directed distribution list, you get a notification email the same day it posts.",
          "**You review the solicitation PDF.** This is the single most important step people skip. It contains the real terms — FOB point, delivery date, inspection point, and often a Procurement History section showing what DLA has paid for this exact item in past awards. That history is your best pricing signal — use it, don't guess.",
          "**You source the item.** Contact the approved manufacturer or an authorized distributor, get real pricing (not an estimate), and confirm they can meet DLA's delivery window.",
          "**You submit a quote through DIBBS** with your unit price, delivery date, and any required certifications. Some RFQs are 'Fast Award Candidates' — meaning DLA can award before the official return-by date if your quote is good enough, so don't wait until the deadline if you have a competitive number ready.",
          "**DLA evaluates and awards.** Typically lowest-priced, technically acceptable, responsible offeror wins — though set-asides change the pool of eligible bidders (see below).",
        ],
      },
      { type: "h2", text: "Set-asides: know which pool you're actually bidding in" },
      {
        type: "p",
        text: "Many DIBBS solicitations are restricted to specific small-business categories: Small Business Set-Aside, Service-Disabled Veteran-Owned Small Business (SDVOSB), HUBZone, Woman-Owned Small Business (WOSB), or 8(a). If a solicitation is set aside for a category you don't qualify for, you can't legally quote on it — check the set-aside designation on the RFQ before you spend time sourcing pricing.",
      },
      { type: "h2", text: "The mistake almost every first-time DIBBS bidder makes" },
      {
        type: "callout",
        text: "Guessing on FOB terms and pricing instead of reading the actual solicitation document. The generic boilerplate on page one of a DIBBS PDF is often NOT the real, item-specific term — the real FOB point, inspection point, and historical pricing are usually a few pages deeper in Section A/B. Read the whole document before you quote, every time.",
      },
      { type: "h2", text: "Where to actually find DIBBS opportunities that match your business" },
      {
        type: "p",
        text: "DLA sends daily email notifications to your CAGE code once you're registered and your NAICS/FSC profile is set up correctly — but that only tells you what's already been directed to you. If you want to catch opportunities in your specific industry before the deadline crunch, tools like NAICS Direct filter live SAM.gov and DIBBS-adjacent opportunities down to your exact NAICS codes, so you're not manually scanning the raw feed every morning.",
      },
      {
        type: "p",
        text: "Whichever way you find them, the fundamentals don't change: get real pricing before you quote, read the actual solicitation text instead of assuming boilerplate applies, and know which set-aside pool you're bidding in before you invest time sourcing.",
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
