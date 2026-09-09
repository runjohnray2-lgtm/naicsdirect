"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutStatus({ verified }: { verified: boolean }) {
  const router = useRouter()
  const [waiting, setWaiting] = useState(true)
  useEffect(() => {
    const refresh = window.setInterval(() => router.refresh(), 3000)
    const timeout = window.setTimeout(() => {
      window.clearInterval(refresh)
      setWaiting(false)
    }, 30000)
    return () => { window.clearInterval(refresh); window.clearTimeout(timeout) }
  }, [router])

  return <div role="status" className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 text-sm text-amber-200">
    <p>{waiting
      ? verified ? "Checkout completed. We are activating your subscription…" : "Checking your checkout status…"
      : "Your subscription is taking longer to confirm. Please don't submit another payment."}</p>
    {!waiting && <p className="mt-2"><button onClick={() => router.refresh()} className="underline">Check again</button>{" or "}<a href="/contact" className="underline">contact support</a>.</p>}
  </div>
}
