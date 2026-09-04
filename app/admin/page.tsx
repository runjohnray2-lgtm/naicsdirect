import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { PLANS } from "@/lib/plans"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminTestAlert from "@/components/admin-test-alert"

export const metadata = {
  title: "Admin Dashboard — NAICS Direct",
}

export const dynamic = "force-dynamic"

function adminEmails() {
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  return new Set([...configured, "agent@radiantz.com", "ray@radiantz.com"])
}

function planForPriceId(priceId: string | null) {
  return PLANS.find((plan) => plan.priceId && plan.priceId === priceId) ?? null
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function date(value: Date | null | undefined) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value)
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin?callbackUrl=/admin")
  if (!adminEmails().has(session.user.email.toLowerCase())) redirect("/")

  const [users, totalUsers, activeBids, pursuits, alertsSent] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        subscription: true,
        _count: {
          select: {
            pursuits: true,
            customCategories: true,
            notificationDeliveries: true,
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.bid.count({ where: { active: true } }),
    prisma.pursuit.count(),
    prisma.notificationDelivery.count(),
  ])

  const subscriptions = users.map((user) => user.subscription).filter(Boolean)
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription?.status === "active" || subscription?.status === "trialing"
  )
  const trials = subscriptions.filter((subscription) => subscription?.status === "trialing").length
  const pastDue = subscriptions.filter((subscription) => subscription?.status === "past_due").length
  const canceled = subscriptions.filter((subscription) => subscription?.status === "canceled").length

  const mrr = activeSubscriptions.reduce((total, subscription) => {
    if (!subscription || subscription.status === "trialing") return total
    const plan = planForPriceId(subscription.stripePriceId)
    return total + (plan?.price ?? 0)
  }, 0)

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">NAICS Direct</p>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/dashboard" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-900">Customer app</Link>
            <Link href="/account" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-900">My account</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Customers" value={String(totalUsers)} detail={`${activeSubscriptions.length} active or trialing`} />
          <Stat label="Monthly recurring revenue" value={money(mrr)} detail={`${trials} free trials`} />
          <Stat label="Active opportunities" value={String(activeBids)} detail={`${pursuits} customer pursuits`} />
          <Stat label="Account health" value={pastDue ? `${pastDue} past due` : "Good"} detail={`${canceled} canceled · ${alertsSent} alerts sent`} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Customers</h2>
              <p className="text-sm text-slate-400">Newest 200 accounts with plan, billing status, activity, and alert usage.</p>
            </div>
            <p className="text-xs text-slate-500">Private admin view</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Billing / Trial</th>
                  <th className="px-5 py-3 font-medium">Pursuits</th>
                  <th className="px-5 py-3 font-medium">Categories</th>
                  <th className="px-5 py-3 font-medium">Alerts</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => {
                  const subscription = user.subscription
                  const plan = planForPriceId(subscription?.stripePriceId ?? null)
                  const billingDate = subscription?.stripeCurrentPeriodEnd ?? subscription?.trialEnd
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{user.name || "Unnamed customer"}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{plan?.name ?? (subscription ? "Unknown plan" : "No plan")}</td>
                      <td className="px-5 py-4"><Status value={subscription?.status ?? "no subscription"} /></td>
                      <td className="px-5 py-4 text-slate-300">{date(billingDate)}</td>
                      <td className="px-5 py-4 text-slate-300">{user._count.pursuits}</td>
                      <td className="px-5 py-4 text-slate-300">{subscription?.selectedNiches.length ?? user._count.customCategories}</td>
                      <td className="px-5 py-4 text-slate-300">{user._count.notificationDeliveries}</td>
                      <td className="px-5 py-4 text-slate-400">{date(user.createdAt)}</td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">No customers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <AdminCard title="Subscription health" items={[
            ["Active / trialing", String(activeSubscriptions.length)],
            ["Free trials", String(trials)],
            ["Past due", String(pastDue)],
            ["Canceled", String(canceled)],
          ]} />
          <AdminCard title="Customer activity" items={[
            ["Total pursuits", String(pursuits)],
            ["Alerts delivered", String(alertsSent)],
            ["Active bid records", String(activeBids)],
            ["Registered users", String(totalUsers)],
          ]} />
          <AdminTestAlert />
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  )
}

function Status({ value }: { value: string }) {
  const positive = value === "active" || value === "trialing"
  const warning = value === "past_due" || value === "incomplete"
  const classes = positive
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
    : warning
      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
      : "border-slate-700 bg-slate-800 text-slate-300"
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${classes}`}>{value.replaceAll("_", " ")}</span>
}

function AdminCard({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-slate-400">{label}</dt>
            <dd className="font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
