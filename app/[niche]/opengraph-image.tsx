import { ImageResponse } from "next/og"
import { PUBLIC_NICHES } from "@/lib/niches"
import { NICHE_SEO } from "@/lib/niche-seo"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function generateStaticParams() {
  return PUBLIC_NICHES.map((n) => ({ niche: n.id }))
}

export default async function OGImage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche } = await params
  const seo = NICHE_SEO[niche]
  const nicheData = PUBLIC_NICHES.find((n) => n.id === niche)
  const title = seo?.h1 ?? nicheData?.name ?? "NAICS Direct"
  const codes = nicheData?.naicsCodes.join(" · ") ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #020617 0%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "#4f46e5",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>NAICS Direct</div>
        </div>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.15, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ fontSize: 26, color: "#94a3b8", marginTop: 24, maxWidth: 900 }}>
          {`NAICS codes: ${codes}`}
        </div>
      </div>
    ),
    { ...size }
  )
}
