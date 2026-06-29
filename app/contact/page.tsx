"use client"

import { useState } from "react"
import Link from "next/link"

interface FormState {
  status: "idle" | "loading" | "success" | "error"
  message: string
}

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>({ status: "idle", message: "" })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState({ status: "loading", message: "" })

    try {
      const response = await fetch("https://formsubmit.co/ajax/ray@radiantz.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || "Not provided",
          subject: formData.subject || "NAICS Support Inquiry",
          message: formData.message,
          _subject: `NAICS Direct: ${formData.subject || "New Contact Message"}`,
          _template: "table",
        }),
      })

      const result = await response.json()

      if (result.success === "true" || result.success === true) {
        setFormState({
          status: "success",
          message: "Message sent! We'll get back to you within 1 business day.",
        })
        setFormData({ name: "", email: "", company: "", subject: "", message: "" })
      } else {
        throw new Error("Submission failed")
      }
    } catch {
      setFormState({
        status: "error",
        message: "Something went wrong. Please email ray@radiantz.com directly.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">N</div>
            <span className="font-bold text-white">NAICS Direct</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/contact" className="text-sm text-indigo-400 font-medium">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-600/20 rounded-full px-4 py-1.5 text-sm text-indigo-400 mb-6">
            Support &amp; Questions
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Questions about pricing, bid alerts, or federal contracting? We respond within 1 business day.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">How We Help</h2>
              <div className="space-y-4">
                {[
                  { icon: "🎯", title: "Bid Discovery", desc: "Get matched to federal contracts in your exact NAICS code" },
                  { icon: "💬", title: "Account Questions", desc: "Billing, plan upgrades, cancellations" },
                  { icon: "🔧", title: "Technical Support", desc: "Dashboard issues, alert setup, data questions" },
                  { icon: "🤝", title: "Partnerships", desc: "Reseller, affiliate, or data integration inquiries" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Response Time</h3>
              <p className="text-xs text-slate-400">
                We respond within{" "}
                <span className="text-indigo-400 font-medium">1 business day</span>.
                For urgent billing issues, include URGENT in your subject.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Already a subscriber?</h3>
              <p className="text-xs text-slate-400 mb-3">Manage alerts and billing directly in your dashboard.</p>
              <Link href="/dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              {formState.status === "success" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    ✅
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 mb-6">{formState.message}</p>
                  <button
                    onClick={() => setFormState({ status: "idle", message: "" })}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jane Smith"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@company.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                        Company <span className="text-slate-500 text-xs">(optional)</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Construction LLC"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                        Subject <span className="text-slate-500 text-xs">(optional)</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Pricing question"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help. Include your NAICS code(s) if relevant."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  {formState.status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                      {formState.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formState.status === "loading"}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {formState.status === "loading" ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    By submitting, you agree to be contacted at the email above. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-bold">N</div>
            <span className="text-sm text-slate-400">NAICS Direct</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-slate-500">&copy; 2026 NAICS Direct. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
