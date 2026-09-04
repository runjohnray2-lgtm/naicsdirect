"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function ConversionTracker({ event, params = {} }: { event: string; params?: Record<string, unknown> }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, params)
    }
  }, [event, params])

  return null
}
