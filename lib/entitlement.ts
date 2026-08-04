import { prisma } from "@/lib/db"
import { nicheLimitForPriceId } from "@/lib/plans"
import { PUBLIC_NICHES } from "@/lib/niches"

/**
 * A subscription only "counts" for niche-gating purposes while it's trialing or active.
 * Canceled / past_due / incomplete subscribers fall back to the free preview experience —
 * same as an anonymous visitor. This intentionally never blocks a logged-in user from
 * browsing; it only decides whether their view is restricted to a chosen niche set.
 */
const GATED_STATUSES = new Set(["trialing", "active"])

export interface Entitlement {
  /** True if this user currently has a paid (or trialing) subscription that should be niche-gated. */
  isGated: boolean
  /** Max number of niches this user's plan allows. */
  nicheLimit: number
  /** The niche IDs the user has actually chosen. Empty until they pick for the first time. */
  selectedNiches: string[]
  /** If set and in the future, the user cannot change selectedNiches themselves. */
  nicheLockedUntil: string | null
  /** Convenience: which niche IDs this user is currently allowed to see full results for. */
  allowedNicheIds: string[]
}

/** Anonymous / unauthenticated / no-subscription visitors get today's free-preview behavior: everything. */
export function anonymousEntitlement(): Entitlement {
  return {
    isGated: false,
    nicheLimit: PUBLIC_NICHES.length,
    selectedNiches: [],
    nicheLockedUntil: null,
    allowedNicheIds: PUBLIC_NICHES.map((n) => n.id),
  }
}

export async function getEntitlement(userId: string | null | undefined): Promise<Entitlement> {
  if (!userId) return anonymousEntitlement()

  const sub = await prisma.subscription.findUnique({ where: { userId } })
  if (!sub || !GATED_STATUSES.has(sub.status)) {
    // No subscription, or lapsed/canceled/past_due — treat like the free preview, don't lock anyone out.
    return anonymousEntitlement()
  }

  const nicheLimit = nicheLimitForPriceId(sub.stripePriceId)
  const selectedNiches = sub.selectedNiches ?? []

  return {
    isGated: true,
    nicheLimit,
    selectedNiches,
    nicheLockedUntil: sub.nicheLockedUntil?.toISOString() ?? null,
    // If they haven't picked yet, allow nothing full-access until they do (dashboard will prompt them).
    allowedNicheIds: selectedNiches,
  }
}
