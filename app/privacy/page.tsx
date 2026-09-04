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
              When you use NAICS Direct, we collect account information such as your email address, profile
              details you choose to provide, selected categories and alert preferences, and basic product
              activity. If you subscribe, Stripe processes your payment information. NAICS Direct does not
              store your full card number or card security code.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">How we use it</h2>
            <p>
              We use account information to provide login access, customize your federal opportunity feed,
              operate pursuit and quote features, send alerts you request, provide support, administer
              subscriptions, prevent abuse, and improve the product. We do not sell your personal data to
              advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Analytics &amp; cookies</h2>
            <p>
              We use essential cookies and similar technologies for authentication and account operation.
              We also use Google Analytics and Vercel Analytics to understand traffic, product usage, and
              conversion performance. These services may use cookies or similar identifiers and may receive
              information such as pages visited, device/browser information, approximate location derived
              from network information, and interaction events. We may use advertising campaign parameters
              such as UTM tags to measure whether marketing produces trials and subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Service providers</h2>
            <p>
              We use service providers to operate NAICS Direct, including providers for hosting, database
              infrastructure, authentication, analytics, email or messaging, and payment processing. These
              providers process information as needed to perform services for us under their own applicable
              terms and privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Federal bid data</h2>
            <p>
              The government contract opportunity data displayed on NAICS Direct comes from public U.S.
              government sources such as SAM.gov. Public procurement data is separate from personal account
              information covered by this policy.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Data retention</h2>
            <p>
              We retain account and transaction-related information as reasonably necessary to operate the
              service, provide support, maintain security, and meet legal, accounting, or tax obligations.
              You may request deletion of eligible personal account data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">Your choices</h2>
            <p>
              You can change alert preferences in your account, manage or cancel your subscription through
              the billing controls, and request access, correction, or deletion of eligible personal data by
              emailing{" "}
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
