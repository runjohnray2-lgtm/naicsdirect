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
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/account")
      if (isProtectedRoute && !isLoggedIn) return false
      return true
    },
  },
} satisfies NextAuthConfig
