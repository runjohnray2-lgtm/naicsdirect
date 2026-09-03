import Link from "next/link"
import { ExternalLink, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Sample Federal Government Quote — NAICS Direct",
  description: "See a sample federal government quotation structure based on FAR commercial-offer requirements and solicitation-specific review.",
}

export default function SampleFederalQuotePage() {
  return <main className="min-h-screen bg-slate-950 text-white py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-indigo-300 text-sm hover:text-white">← NAICS Direct</Link>
      <div className="mt-6 mb-8"><h1 className="text-3xl sm:text-4xl font-bold">Sample Federal Government Quote</h1><p className="text-slate-400 mt-3 max-w-3xl leading-7">This sample shows the baseline information NAICS Direct can assemble automatically. It is not a substitute for the solicitation: the actual RFQ can require a specific form, line-item schedule, technical response, representations, attachments, signatures, delivery terms, or other instructions.</p></div>

      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-9 shadow-2xl">
        <header className="border-b border-slate-200 pb-5">
          <h2 className="text-2xl font-bold text-indigo-800">Example Contractor LLC</h2>
          <p className="text-sm text-slate-600 mt-1">123 Example Avenue, Portland, OR 97201</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm"><span><strong>Unique Entity ID:</strong> EXAMPLE12345</span><span><strong>CAGE:</strong> 1AB23</span></div>
          <p className="text-sm text-slate-600 mt-1">quotes@examplecontractor.com · 503-555-0100</p>
        </header>

        <section className="mt-6"><h3 className="text-xl font-bold">Quotation — Recurring Grounds Maintenance</h3><p className="text-slate-600 mt-1"><strong>Solicitation:</strong> ABC-26-Q-0123</p><p className="text-slate-600"><strong>Quote date:</strong> September 3, 2026</p><p className="text-slate-600"><strong>Offer valid:</strong> 30 days</p></section>

        <section className="mt-6"><h4 className="font-bold uppercase tracking-wide text-sm text-slate-600">Technical / Scope Response</h4><p className="mt-2 leading-7 text-sm">Example Contractor LLC proposes to provide the products and/or services described in the solicitation, including all required labor, supervision, equipment, transportation, and performance necessary to meet the stated requirements. Performance will comply with the solicitation, incorporated specifications, amendments, and accepted clarifications.</p></section>

        <section className="mt-6"><h4 className="font-bold uppercase tracking-wide text-sm text-slate-600">Price</h4><div className="mt-2 border border-slate-200 rounded-lg overflow-hidden"><div className="grid grid-cols-[1fr_100px_120px] bg-slate-100 text-xs font-semibold p-3"><span>Item / CLIN</span><span className="text-right">Qty</span><span className="text-right">Price</span></div><div className="grid grid-cols-[1fr_100px_120px] p-3 text-sm border-t border-slate-200"><span>Recurring grounds maintenance — base period</span><span className="text-right">1</span><span className="text-right font-semibold">$24,850.00</span></div></div><p className="text-right text-xl font-bold mt-4">Total Quote: $24,850.00</p></section>

        <section className="mt-6"><h4 className="font-bold uppercase tracking-wide text-sm text-slate-600">Delivery / Performance</h4><p className="mt-2 text-sm leading-7">Performance will begin and continue according to the solicitation schedule and designated place of performance.</p></section>

        <section className="mt-6"><h4 className="font-bold uppercase tracking-wide text-sm text-slate-600">Assumptions / Clarifications</h4><p className="mt-2 text-sm leading-7">Pricing is based on the solicitation and amendments available as of the quote date. Any material change to quantities, scope, schedule, site conditions, or incorporated requirements may require a revised quotation.</p></section>

        <section className="mt-6 border-t border-slate-200 pt-5"><p className="text-sm"><strong>Authorized Representative:</strong> Jordan Example</p><p className="text-sm text-slate-600">Example Contractor LLC</p><p className="text-sm text-slate-600 mt-2"><strong>Remit to:</strong> Same as business address</p></section>
      </div>

      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-5"><div className="flex items-start gap-3"><ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" /><div><h2 className="font-semibold">What NAICS Direct checks</h2><p className="text-slate-400 text-sm mt-2 leading-6">The baseline follows the federal commercial-offer framework, but the solicitation controls. NAICS Direct should compare the actual RFQ instructions, forms, evaluation factors, amendments, required representations, line items, delivery terms, and submission method before calling a quote submission-ready.</p><div className="flex flex-wrap gap-4 mt-3"><a href="https://www.acquisition.gov/far/52.212-1" target="_blank" rel="noreferrer" className="text-indigo-300 text-sm hover:text-white">FAR 52.212-1 <ExternalLink className="w-3 h-3 inline" /></a><a href="https://www.acquisition.gov/far/52.204-7" target="_blank" rel="noreferrer" className="text-indigo-300 text-sm hover:text-white">SAM / UEI requirement <ExternalLink className="w-3 h-3 inline" /></a><a href="https://www.acquisition.gov/far/52.204-16" target="_blank" rel="noreferrer" className="text-indigo-300 text-sm hover:text-white">CAGE reporting <ExternalLink className="w-3 h-3 inline" /></a><a href="https://www.acquisition.gov/far/part-13" target="_blank" rel="noreferrer" className="text-indigo-300 text-sm hover:text-white">Simplified acquisitions <ExternalLink className="w-3 h-3 inline" /></a></div></div></div></div>
    </div>
  </main>
}
