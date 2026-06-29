export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 14,
    interval: "month",
    description: "Perfect for small contractors just getting started",
    features: [
      "1 NAICS niche",
      "Daily bid alerts via email",
      "Real SAM.gov data",
      "Basic keyword filters",
    ] as string[],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? "",
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
      "Real-time bid alerts",
      "SAM.gov + USASpending data",
      "Advanced filters & search",
      "Export to CSV",
      "Priority support",
    ] as string[],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
    popular: true,
    cta: "Start Free Trial",
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    interval: "month",
    description: "For teams and established contractors winning big",
    features: [
      "All 8 NAICS niches",
      "Real-time alerts",
      "Full data access",
      "5 team seats",
      "API access",
      "White-label reports",
      "Dedicated support",
    ] as string[],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ?? "",
    cta: "Start Free Trial",
  },
] as const

export type Plan = (typeof PLANS)[number]
export type PlanId = "starter" | "pro" | "business"
