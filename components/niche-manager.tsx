"use client"

import { useEffect, useState } from "react"
import { PUBLIC_NICHES } from "@/lib/niches"

interface EntitlementState {
  isGated: boolean
  nicheLimit: number
  selectedNiches: string[]
  pendingNiches: string[]
  nicheLockedUntil: string | null
  billingPeriodEnd: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function nicheNames(ids: string[]) {
  const names = ids
    .map((id) => PUBLIC_NICHES.find((n) => n.id === id)?.name)
    .filter(Boolean)
  return names.join(", ")
}

export default function NicheManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [entitlement, setEntitlement] = useState<EntitlementState | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/account/niches")
      .then((res) => res.json())
      .then((data: EntitlementState) => {
        setEntitlement(data)
        setPicked(data.pendingNiches?.length ? data.pendingNiches : data.selectedNiches)
      })
      .catch(() => setError("Couldn't load your category settings."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-slate-500 text-sm">Loading your categories...</p>
      </div>
    )
  }

  if (!entitlement || !entitlement.isGated) {
    return null
  }

  const isFirstPick = entitlement.selectedNiches.length === 0
  const isPureAddition = entitlement.selectedNiches.every((id) => picked.includes(id))
  const baseline = entitlement.pendingNiches?.length
    ? entitlement.pendingNiches
    : entitlement.selectedNiches

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((n) => n !== id)
      if (prev.length >= entitlement.nicheLimit) return prev
      return [...prev, id]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch("/api/account/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niches: picked }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't save your categories.")
        return
      }

      setEntitlement((prev) =>
        prev
          ? {
              ...prev,
              selectedNiches: data.selectedNiches,
              pendingNiches: data.pendingNiches ?? [],
              nicheLockedUntil: data.nicheLockedUntil,
              billingPeriodEnd: data.billingPeriodEnd,
            }
          : prev
      )

      if (data.queued) {
        setNotice(
          `Change saved for your next billing period${data.billingPeriodEnd ? ` starting after ${formatDate(data.billingPeriodEnd)}` : ""}. Your current categories stay active until then.`
        )
      } else {
        setNotice("Your category access was updated now.")
      }
    } catch {
      setError("Couldn't save your categories. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges =
    JSON.stringify([...picked].sort()) !== JSON.stringify([...baseline].sort())

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Your Categories
        </h2>
        <span className="text-xs text-slate-500">
          {picked.length} / {entitlement.nicheLimit} selected
        </span>
      </div>

      <p className="text-slate-500 text-xs mb-4">
        {isFirstPick
          ? `Choose up to ${entitlement.nicheLimit} categor${entitlement.nicheLimit === 1 ? "y" : "ies"}. Your first selection becomes active immediately.`
          : "Your current categories stay fixed for the paid billing period. A swap or removal is queued for the next billing cycle. Upgrading can add categories immediately."}
      </p>

      {!isFirstPick && (
        <div className="bg-slate-800/50 border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-400 mb-4">
          <span className="text-slate-300 font-medium">Current billing period:</span>{" "}
          {nicheNames(entitlement.selectedNiches) || "None"}
          {entitlement.billingPeriodEnd && (
            <span> · through {formatDate(entitlement.billingPeriodEnd)}</span>
          )}
        </div>
      )}

      {entitlement.pendingNiches?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-400 mb-4">
          Next billing period: {nicheNames(entitlement.pendingNiches)}
        </div>
      )}

      {notice && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm text-green-400 mb-4">
          {notice}
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
          const atLimit = !isSelected && picked.length >= entitlement.nicheLimit

          return (
            <button
              key={niche.id}
              type="button"
              disabled={atLimit}
              onClick={() => toggle(niche.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left border transition-colors ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
              } ${atLimit ? "opacity-50 cursor-not-allowed" : ""}`}
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
        {saving
          ? "Saving..."
          : isFirstPick
            ? "Confirm Categories"
            : isPureAddition
              ? "Add Categories Now"
              : "Queue for Next Billing Cycle"}
      </button>
    </div>
  )
}
