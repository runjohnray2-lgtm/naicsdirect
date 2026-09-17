"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { safeCallbackUrl } from "@/lib/auth-navigation"
import { PLANS } from "@/lib/plans"

function SignInForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"))
  const chosenPlan = PLANS.find(plan => callbackUrl === `/pricing?plan=${plan.id}`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("resend", {
        email: email.trim(),
        redirect: false,
        callbackUrl,
      })
      if (!result || result.error) {
        setError("We couldn't send your sign-in link. Please try again.")
        return
      }
      router.push(`/auth/verify?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    } catch {
      setError("We couldn't connect. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {chosenPlan && <p className="rounded-lg bg-indigo-500/10 p-3 text-sm text-indigo-200">{chosenPlan.name}: 7 days free, then ${chosenPlan.price}/month. Verify your email, then continue to secure checkout.</p>}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Work Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
      </div>

      {error && (
        <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
      >
        {loading ? "Sending sign-in link..." : "Email Me a Sign-In Link"}
      </button>

      <p className="text-center text-xs text-slate-500">
        New here? This also creates your account. No password needed.
      </p>
    </form>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <nav className="border-b border-slate-800 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              N
            </div>
            <span className="font-bold text-white">NAICS Direct</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create an account or sign in</h1>
            <p className="text-slate-400 text-sm">
              Enter your email to get a secure sign-in link.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <Suspense
              fallback={
                <div className="h-32 animate-pulse bg-slate-800 rounded-lg" />
              }
            >
              <SignInForm />
            </Suspense>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Want to compare plans?{" "}
            <Link
              href="/pricing"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View pricing
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
