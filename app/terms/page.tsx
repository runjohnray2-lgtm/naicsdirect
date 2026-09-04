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
              NAICS Direct is a subscription service that helps small contractors and suppliers find,
              organize, research, source, price, and pursue publicly available U.S. federal contract
              opportunities. Opportunity data is sourced from SAM.gov's public API and related public
              government sources. We do not guarantee that any opportunity shown will result in a contract
              award, and the authoritative solicitation and agency instructions always control.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Accounts, free trial &amp; subscriptions</h2>
            <p>
              You need an account to access subscriber features. New paid-plan signups currently include a
              7-day free trial and require a payment method at checkout. Unless you cancel before the trial
              ends, Stripe will automatically begin monthly billing at the price of the plan you selected.
              Paid plans renew monthly until canceled. There are no long-term contracts.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Data accuracy &amp; solicitation review</h2>
            <p>
              We pull opportunity data from public government sources and work to keep it current, but we
              cannot guarantee that every listing is complete, accurate, or up to date at the moment you
              view it. Always verify the full authoritative posting before acting. A complete bid review may
              require reading every linked solicitation page, attachment, amendment, Q&amp;A, specification,
              drawing, clause, form, delivery requirement, and submission instruction.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Acceptable use</h2>
            <p>
              You agree not to scrape, resell, or redistribute the filtered platform content in bulk, and
              not to attempt to circumvent account, access, or payment restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Cancellation &amp; refunds</h2>
            <p>
              You can cancel from your NAICS Direct account billing controls. Cancellation is effective at
              the end of the current trial or paid billing period, as applicable. Canceling during the free
              trial before the trial ends prevents the first subscription charge. For paid months, we do not
              normally provide prorated refunds for unused partial periods, but contact us if you believe a
              billing error occurred.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Limitation of liability</h2>
            <p>
              NAICS Direct is provided "as is." We are not liable for business decisions made based on data
              shown on the platform, including missed bids, inaccurate listings, supplier decisions, bid
              outcomes, or downtime. To the extent permitted by law, our total liability to you is limited
              to the amount you paid us in the past 3 months.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Changes to these terms</h2>
            <p>
              We may update these terms as the product evolves. We will post the updated date at the top of
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
