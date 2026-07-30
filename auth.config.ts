import type { NextAuthConfig } from "next-auth"

// Edge-safe config — NO PrismaAdapter, NO Node.js APIs.
// Used by middleware.ts (Edge Runtime) AND spread into auth.ts (Node Runtime).
export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  providers: [], // providers are added in auth.ts only
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      // /dashboard itself is the public, no-signup-required live demo — anonymous
      // visitors can browse it (DIBBS bids show a blurred teaser until they sign up).
      // Only the account page and the deeper server-rendered bids view require login.
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard/bids") ||
        nextUrl.pathname.startsWith("/account") ||
        nextUrl.pathname.startsWith("/radiantz-bids")
      if (isProtectedRoute && !isLoggedIn) return false
      return true
    },
  },
} satisfies NextAuthConfig
