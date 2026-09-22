import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AppNav from "@/components/app-nav"
import CompanyProfile from "@/components/company-profile"

export const metadata = {
  title: "Federal Quote Profile — NAICS Direct",
}

export default async function QuoteProfilePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin?callbackUrl=/quote-profile")

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Federal Quote Profile</h1>
          <p className="text-slate-400 mt-2">
            Set the business information NAICS Direct inserts into federal quote drafts. Keep this aligned with your SAM.gov registration.
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <Link href="/pursuits" className="text-indigo-300 hover:text-indigo-200">My Pursuits →</Link>
            <Link href="/sample-federal-quote" className="text-indigo-300 hover:text-indigo-200">View sample federal quote →</Link>
          </div>
        </div>

        <CompanyProfile />
      </main>
    </div>
  )
}
