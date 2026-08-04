"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function ConfirmContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")

  const handleConfirm = () => {
    if (url) {
      window.location.href = url
    }
  }

  if (!url) {
    return (
      <div className="text-center">
        <p className="text-slate-400 text-sm mb-4">
          This confirmation link is missing its sign-in token.
        </p>
        <Link
          href="/auth/signin"
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-slate-400 text-sm mb-6">
        Click below to finish signing in. This confirms a real click (not an
        automated email scanner) before your one-time link is used.
      </p>
      <button
        onClick={handleConfirm}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
      >
        Confirm Sign In
      </button>
    </div>
  )
}

export default function ConfirmPage() {
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
            <h1 className="text-3xl font-bold text-white mb-2">Almost there</h1>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <Suspense
              fallback={
                <div className="h-32 animate-pulse bg-slate-800 rounded-lg" />
              }
            >
              <ConfirmContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
