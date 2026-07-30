import Link from "next/link"

export const metadata = {
  title: "Terms of Service — NAICS Direct",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">&larr; Back to NAICS Direct</Link>
        <h1 className="text-3xl font-bold text-white mt-6 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">What NAICS Direct is</h2>
            <p>
              NAICS Direct is a subscription service that filters publicly available U.S. federal contract
              opportunity data (sourced from SAM.gov's public API) by industry, so contractors can find
              relevant bids without sifting through unrelated listings. We do not submit bids on your
              behalf, and we do not guarantee that any bid shown will result in a contract award.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Accounts &amp; subscriptions</h2>
            <p>
              You need an account to access filtered dashboards and alerts. Paid plans are billed monthly
              through Stripe and can be canceled at any time — you will retain access through the end of
              your current billing period. There are no long-term contracts.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Data accuracy</h2>
            <p>
              We pull data directly from SAM.gov's public API and do our best to keep it current, but we
              cannot guarantee that every listing is complete, accurate, or up to date at the moment you
              view it. Always verify solicitation details directly on SAM.gov before submitting a bid or
              making a business decision.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Acceptable use</h2>
            <p>
              You agree not to scrape, resell, or redistribute the filtered data or platform content in
              bulk, and not to attempt to circumvent account or payment restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Cancellation &amp; refunds</h2>
            <p>
              You can cancel anytime from your account or by emailing us. Since plans are billed monthly
              with no lock-in contract, we don't offer prorated refunds for partial months, but we'll work
              with you in good faith on billing issues — just reach out.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Limitation of liability</h2>
            <p>
              NAICS Direct is provided "as is." We are not liable for business decisions made based on data
              shown on the platform, including missed bids, inaccurate listings, or downtime. Our total
              liability to you is limited to the amount you paid us in the past 3 months.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Changes to these terms</h2>
            <p>
              We may update these terms as the product evolves. We'll post the updated date at the top of
              this page. Continued use of NAICS Direct after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Contact</h2>
            <p>
              Questions? Email{" "}
              <a href="mailto:ray@radiantz.com" className="text-indigo-400 hover:text-indigo-300">ray@radiantz.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
