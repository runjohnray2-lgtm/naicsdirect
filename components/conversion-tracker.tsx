"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function ConversionTracker({ event, eventId, params = {} }: { event: string; eventId: string; params?: Record<string, unknown> }) {
  const serializedParams = JSON.stringify(params)
  useEffect(() => {
    const key = `naics-conversion:${event}:${eventId}`
    let attempts = 0
    const send = () => {
      try {
        if (localStorage.getItem(key)) return true
      } catch { /* Tracking must not interrupt customers with blocked storage. */ }
      if (!window.gtag) return false
      window.gtag("event", event, JSON.parse(serializedParams))
      try { localStorage.setItem(key, "sent") } catch { /* Storage is optional. */ }
      return true
    }
    if (send()) return
    const timer = window.setInterval(() => {
      if (send() || ++attempts >= 40) window.clearInterval(timer)
    }, 250)
    return () => window.clearInterval(timer)
  }, [event, eventId, serializedParams])

  return null
}
