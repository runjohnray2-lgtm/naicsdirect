// Edge Runtime — only imports auth.config.ts (no Prisma, no Node.js APIs).
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico|$).*)"],
}
