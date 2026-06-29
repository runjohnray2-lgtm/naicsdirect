import Link from "next/link"

export const metadata = {
  title: "Check Your Email — NAICS Direct",
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      <nav className="border-b border-slate-800 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              N
            </div>
            <span className="font-bold text-white">NAICS Direct</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-600/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            &#128231;
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Check Your Email
          </h1>
          <p className="text-slate-400 mb-6">
            We sent a magic link to your email. Click it to sign in — no
            password needed. The link expires in 10 minutes.
          </p>
          <p className="text-xs text-slate-500">
            Didn&apos;t get it? Check your spam or{" "}
            <Link
              href="/auth/signin"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              try again
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
