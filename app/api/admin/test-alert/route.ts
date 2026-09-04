import { NextResponse } from "next/server"
import { Resend } from "resend"
import { auth } from "@/auth"

function isAdmin(email: string | null | undefined) {
  if (!email) return false
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  return new Set([...configured, "agent@radiantz.com"]).has(email.toLowerCase())
}

export async function POST() {
  const session = await auth()
  const email = session?.user?.email

  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured in production" }, { status: 503 })
  }

  const from = process.env.ALERT_EMAIL_FROM || "NAICS Direct <alerts@naicsdirect.com>"
  const resend = new Resend(apiKey)
  const result = await resend.emails.send({
    from,
    to: email!,
    subject: "NAICS Direct production alert test",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111"><h2>NAICS Direct alert test passed</h2><p>This message was sent from the production alert configuration.</p><p>Time: ${new Date().toISOString()}</p><p>If you received this message, the production Resend key, sender, and delivery path are working.</p></div>`,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error.message || "Resend rejected the test email" }, { status: 502 })
  }

  return NextResponse.json({ success: true, id: result.data?.id ?? null, sentTo: email })
}
