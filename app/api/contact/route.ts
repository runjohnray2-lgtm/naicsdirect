import { NextResponse } from "next/server"
import { Resend } from "resend"

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = clean(body.name, 120)
    const email = clean(body.email, 200)
    const company = clean(body.company, 160)
    const subject = clean(body.subject, 160) || "NAICS Direct support inquiry"
    const message = clean(body.message, 5000)
    const website = clean(body.website, 200)

    // Honeypot field: bots often fill every input. Return success without sending.
    if (website) return NextResponse.json({ success: true })

    if (!name || !email || !message || !email.includes("@")) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY
    if (!apiKey) {
      console.error("Contact form email provider is not configured")
      return NextResponse.json({ error: "Support email is temporarily unavailable." }, { status: 503 })
    }

    const from = process.env.ALERT_EMAIL_FROM || process.env.EMAIL_FROM || "NAICS Direct <alerts@naicsdirect.com>"
    const to = process.env.CONTACT_EMAIL || "agent@radiantz.com"
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `NAICS Direct: ${subject}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
        <h2>New NAICS Direct contact</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || "Not provided")}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>`,
    })

    if (result.error) {
      console.error("Contact form provider error:", result.error)
      return NextResponse.json({ error: "Your message could not be sent. Please try again." }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Your message could not be sent. Please try again." }, { status: 500 })
  }
}
