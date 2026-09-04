export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 14,
    interval: "month",
    description: "Perfect for small contractors just getting started",
    features: [
      "1 NAICS category per billing period",
      "Live SAM.gov data, synced daily",
      "Urgency filtering (closing soon, this week, open)",
      "Queue a category change for your next billing cycle",
    ] as string[],
    // Verified live Stripe price for $14/month.
    priceId: "price_1TmjBwK5DEMkaeXv2oy8Z41n",
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
      "3 NAICS categories per billing period",
      "Live SAM.gov data, synced daily",
      "Urgency filtering (closing soon, this week, open)",
      "Queue category changes for your next billing cycle",
      "Priority support",
    ] as string[],
    // Verified live Stripe price for $29/month.
    priceId: "price_1TmjBwK5DEMkaeXv5vnVB7Gl",
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
      "All 15 NAICS categories",
      "Live SAM.gov data, synced daily",
      "Urgency filtering (closing soon, this week, open)",
      "Dedicated support",
    ] as string[],
    // Verified live Stripe price for $49/month.
    priceId: "price_1TmjBwK5DEMkaeXvKWBRic1B",
    nicheLimit: 15,
    cta: "Start Free Trial",
  },
] as const

export type Plan = (typeof PLANS)[number]
export type PlanId = "starter" | "pro" | "business"

/** Look up the category limit for a given Stripe price ID. Falls back to 1 (safest default) if unrecognized. */
export function nicheLimitForPriceId(priceId: string | null | undefined): number {
  const plan = PLANS.find((p) => p.priceId === priceId)
  return plan?.nicheLimit ?? 1
}
