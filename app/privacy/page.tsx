import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — NAICS Direct",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">&larr; Back to NAICS Direct</Link>
        <h1 className="text-3xl font-bold text-white mt-6 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">What we collect</h2>
            <p>
              When you use NAICS Direct, we collect the email address you sign up with, your selected
              industry niche(s), and basic account activity (login times, pages viewed). If you subscribe
              to a paid plan, payment is processed directly by Stripe — we never see or store your card
              details.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">How we use it</h2>
            <p>
              We use your email to send login links, deadline alerts you opt into, and occasional product
              updates. We use your niche selection to filter the federal bid data we show you. We don't
              sell, rent, or share your personal data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Federal bid data</h2>
            <p>
              The contract opportunity data displayed on NAICS Direct comes from SAM.gov's public API.
              This is U.S. government procurement data and is public domain — it is not personal data and
              is not affected by this policy.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Data retention</h2>
            <p>
              We retain your account information for as long as your account is active. If you cancel your
              subscription or request deletion, we will remove your personal account data within a
              reasonable timeframe, except where we're required to retain records for legal or tax purposes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Cookies</h2>
            <p>
              We use essential cookies to keep you signed in and to remember your niche preferences. We do
              not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Your rights</h2>
            <p>
              You can request a copy of your data, ask us to correct it, or ask us to delete your account
              entirely at any time by emailing us at{" "}
              <a href="mailto:ray@radiantz.com" className="text-indigo-400 hover:text-indigo-300">ray@radiantz.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Contact</h2>
            <p>
              Questions about this policy? Email{" "}
              <a href="mailto:ray@radiantz.com" className="text-indigo-400 hover:text-indigo-300">ray@radiantz.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
