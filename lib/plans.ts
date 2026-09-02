export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 14,
    interval: "month",
    description: "Perfect for small contractors just getting started",
    features: [
      "1 NAICS niche",
      "Live SAM.gov data, synced daily",
      "Urgency filtering (closing soon, this week, open)",
    ] as string[],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? "",
    nicheLimit: 1,
    cta: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    interval: "month",
    description: "For contractors actively bidding multiple categories",
    features: [
      "3 NAICS niches",
      "Live SAM.gov data, synced daily",
      "Urgency filtering (closing soon, this week, open)",
      "Priority support",
    ] as string[],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
    nicheLimit: 3,
    popular: true,
    cta: "Start Free Trial",
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    interval: "month",
    description: "For teams, distributors, and multi-category contractors",
    features: [
      "All 15 NAICS niches",
      "Live SAM.gov data, synced daily",
      "Urgency filtering (closing soon, this week, open)",
      "Dedicated support",
    ] as string[],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ?? "",
    nicheLimit: 15,
    cta: "Start Free Trial",
  },
] as const

export type Plan = (typeof PLANS)[number]
export type PlanId = "starter" | "pro" | "business"

/** Look up the niche limit for a given Stripe price ID. Falls back to 1 (safest default) if unrecognized. */
export function nicheLimitForPriceId(priceId: string | null | undefined): number {
  const plan = PLANS.find((p) => p.priceId === priceId)
  return plan?.nicheLimit ?? 1
}

/** Number of days a niche selection is locked before the subscriber can change it themselves. */
export const NICHE_LOCK_DAYS = 21
