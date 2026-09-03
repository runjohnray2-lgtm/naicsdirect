"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Mail, MessageSquareText } from "lucide-react"

interface Preference {
  emailNewPosts: boolean
  emailDeadlines: boolean
  smsNewPosts: boolean
  smsDeadlines: boolean
  phone: string | null
  deadlineHours: number[]
  timezone: string
}

const DEFAULTS: Preference = {
  emailNewPosts: true,
  emailDeadlines: true,
  smsNewPosts: false,
  smsDeadlines: false,
  phone: null,
  deadlineHours: [168, 72, 24],
  timezone: "UTC",
}

export default function NotificationSettings() {
  const [pref, setPref] = useState<Preference>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/account/notifications", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.preference) setPref(data.preference)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || pref.timezone || "UTC"
      const response = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pref, timezone }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save alerts")
      setPref(data.preference)
      setMessage("Alert preferences saved.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save alerts")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-500">Loading alert settings…</div>

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><Bell className="w-5 h-5 text-indigo-300" /></div>
        <div><h2 className="text-white font-semibold">Bid Alerts</h2><p className="text-sm text-slate-500 mt-1">Choose how NAICS Direct should alert you when new matches post or deadlines get close.</p></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white font-medium text-sm mb-3"><Mail className="w-4 h-4 text-indigo-300" />Email</div>
          <label className="flex items-center gap-3 text-sm text-slate-300 mb-3"><input type="checkbox" checked={pref.emailNewPosts} onChange={e => setPref({ ...pref, emailNewPosts: e.target.checked })} />New matching opportunities</label>
          <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={pref.emailDeadlines} onChange={e => setPref({ ...pref, emailDeadlines: e.target.checked })} />Upcoming deadlines</label>
        </div>

        <div className="border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white font-medium text-sm mb-3"><MessageSquareText className="w-4 h-4 text-indigo-300" />Text message</div>
          <label className="flex items-center gap-3 text-sm text-slate-300 mb-3"><input type="checkbox" checked={pref.smsNewPosts} onChange={e => setPref({ ...pref, smsNewPosts: e.target.checked })} />New matching opportunities</label>
          <label className="flex items-center gap-3 text-sm text-slate-300 mb-3"><input type="checkbox" checked={pref.smsDeadlines} onChange={e => setPref({ ...pref, smsDeadlines: e.target.checked })} />Upcoming deadlines</label>
          <Input placeholder="+15415551212" value={pref.phone || ""} onChange={e => setPref({ ...pref, phone: e.target.value })} className="bg-slate-950 border-slate-700 text-white" />
          <p className="text-xs text-slate-600 mt-2">SMS delivery will activate when the texting provider is connected. Standard message/data rates may apply.</p>
        </div>
      </div>

      <div className="mt-4 border border-slate-800 rounded-xl p-4">
        <p className="text-sm font-medium text-white mb-2">Deadline reminders</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          {[168, 72, 24].map(hours => <label key={hours} className="flex items-center gap-2"><input type="checkbox" checked={pref.deadlineHours.includes(hours)} onChange={e => setPref({ ...pref, deadlineHours: e.target.checked ? [...pref.deadlineHours, hours] : pref.deadlineHours.filter(v => v !== hours) })} />{hours === 168 ? "7 days" : hours === 72 ? "3 days" : "24 hours"}</label>)}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3"><Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500">{saving ? "Saving…" : "Save Alert Settings"}</Button>{message && <span className="text-xs text-slate-400">{message}</span>}</div>
    </section>
  )
}
