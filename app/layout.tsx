import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "NAICS Direct — Federal Bids Filtered For Your Industry",
  description: "Stop paying $500/month for bids you don't need. NAICS Direct shows only contracts in your exact industry. Real SAM.gov data. Starting at $29/month.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
