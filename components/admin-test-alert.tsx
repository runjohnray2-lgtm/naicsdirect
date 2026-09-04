"use client"

import { useState } from "react"

export default function AdminTestAlert() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function sendTest() {
    setState("sending")
    setMessage("")

    try {
      const response = await fetch("/api/admin/test-alert", { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Test failed")
      setState("success")
      setMessage(`Sent to ${data.sentTo}. Check the inbox for “NAICS Direct production alert test.”`)
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "Test failed")
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="font-semibold">Production alert test</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Sends a real email through the same production Resend configuration used by bid alerts.
      </p>
      <button
        type="button"
        onClick={sendTest}
        disabled={state === "sending"}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "sending" ? "Sending test…" : "Send Test Alert"}
      </button>
      {message && (
        <p className={`mt-3 text-xs ${state === "success" ? "text-emerald-400" : "text-amber-400"}`}>{message}</p>
      )}
    </div>
  )
}
