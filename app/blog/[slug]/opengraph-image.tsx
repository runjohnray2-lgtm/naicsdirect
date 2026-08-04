import { ImageResponse } from "next/og"
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  const title = post?.title ?? "NAICS Direct Blog"

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
          <div style={{ fontSize: 34, fontWeight: 700 }}>NAICS Direct Blog</div>
        </div>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.2, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ fontSize: 26, color: "#94a3b8", marginTop: 24 }}>
          By Ray Runyan, Founder
        </div>
      </div>
    ),
    { ...size }
  )
}
