"use client"

import { useEffect, useState } from "react"
import { PUBLIC_NICHES } from "@/lib/niches"

interface EntitlementState {
  isGated: boolean
  nicheLimit: number
  selectedNiches: string[]
  nicheLockedUntil: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function NicheManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entitlement, setEntitlement] = useState<EntitlementState | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/account/niches")
      .then((res) => res.json())
      .then((data: EntitlementState) => {
        setEntitlement(data)
        setPicked(data.selectedNiches)
      })
      .catch(() => setError("Couldn't load your niche settings."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-slate-500 text-sm">Loading your niches...</p>
      </div>
    )
  }

  if (!entitlement || !entitlement.isGated) {
    // No active/trialing subscription — nothing to manage yet.
    return null
  }

  const isLocked = entitlement.nicheLockedUntil
    ? new Date(entitlement.nicheLockedUntil) > new Date()
    : false
  const isFirstPick = entitlement.selectedNiches.length === 0
  const isPureAddition = entitlement.selectedNiches.every((id) => picked.includes(id))
  const canSaveDespiteLock = isFirstPick || isPureAddition

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((n) => n !== id)
      if (prev.length >= entitlement.nicheLimit) return prev // at limit, ignore
      return [...prev, id]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/account/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niches: picked }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't save your niches.")
        return
      }
      setEntitlement((prev) =>
        prev ? { ...prev, selectedNiches: data.selectedNiches, nicheLockedUntil: data.nicheLockedUntil } : prev
      )
    } catch {
      setError("Couldn't save your niches. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify([...picked].sort()) !== JSON.stringify([...entitlement.selectedNiches].sort())

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Your Niches
        </h2>
        <span className="text-xs text-slate-500">
          {picked.length} / {entitlement.nicheLimit} selected
        </span>
      </div>
      <p className="text-slate-500 text-xs mb-4">
        {isFirstPick
          ? `Choose up to ${entitlement.nicheLimit} niche${entitlement.nicheLimit === 1 ? "" : "s"} to unlock full results on your dashboard.`
          : "Adding niches (up to your plan limit) is always allowed. Removing or swapping a niche is locked for 21 days after your last change."}
      </p>

      {isLocked && !canSaveDespiteLock && entitlement.nicheLockedUntil && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-400 mb-4">
          You can change which niches you&apos;re removing/swapping again on{" "}
          {formatDate(entitlement.nicheLockedUntil)}. Need it sooner? Email support with a
          reason and we&apos;ll take care of it.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {PUBLIC_NICHES.map((niche) => {
          const isSelected = picked.includes(niche.id)
          const wasAlreadySelected = entitlement.selectedNiches.includes(niche.id)
          // A checkbox is disabled if: we're locked AND this would be a removal of an
          // already-selected niche (unchecking it) rather than a fresh addition.
          const disallowRemoval = isLocked && !isFirstPick && wasAlreadySelected && isSelected
          const atLimit = !isSelected && picked.length >= entitlement.nicheLimit

          return (
            <button
              key={niche.id}
              type="button"
              disabled={disallowRemoval || atLimit}
              onClick={() => toggle(niche.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left border transition-colors ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
              } ${disallowRemoval || atLimit ? "opacity-50 cursor-not-allowed" : ""}`}
              title={disallowRemoval ? "Locked until your 21-day window is up" : undefined}
            >
              <span>{niche.emoji}</span>
              <span className="truncate">{niche.name}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !hasChanges || picked.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : isFirstPick ? "Confirm Niches" : "Save Changes"}
      </button>
    </div>
  )
}
