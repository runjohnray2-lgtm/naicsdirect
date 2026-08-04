import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // JWT sessions so the Edge middleware (no DB access there) can verify
  // login state straight from the cookie instead of needing a DB round trip.
  session: { strategy: "jwt" },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      // Use `||` (not `??`) so a blank/empty env var still falls back to the default sender.
      from: process.env.EMAIL_FROM || "NAICS Direct <noreply@naicsdirect.com>",
      // BUG FIX: magic links were failing verification ("Unable to sign in / link
      // no longer valid") even on the very first, never-before-clicked link. Root
      // cause: Auth.js's magic-link token is single-use and gets consumed on the
      // very first GET to the callback URL. Google Workspace/Gmail (and many
      // corporate email gateways) automatically pre-fetch links inside inbound
      // email to scan them for phishing/malware BEFORE the user ever opens the
      // message - that automated pre-fetch silently burns the token, so every
      // real human click then fails.
      //
      // Fix: point the emailed link at our own harmless confirmation page
      // (/auth/confirm) instead of the raw token URL. Scanner pre-fetches just
      // load a static page and do nothing. The token-consuming callback URL is
      // only ever requested when a human actually clicks the "Confirm Sign In"
      // button on that page.
      async sendVerificationRequest({ identifier, url, provider }) {
        const confirmUrl = `${process.env.AUTH_URL ?? "https://naicsdirect.com"}/auth/confirm?url=${encodeURIComponent(url)}`

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: "Sign in to naicsdirect.com",
            text: `Sign in to naicsdirect.com\n${confirmUrl}\n\n`,
            html: `<body style="background: #f9f9f9;">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
        Sign in to <strong>naicsdirect&#8203;.com</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="#346df1"><a href="${confirmUrl}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #346df1; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>`,
          }),
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Resend error (${res.status}): ${text}`)
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
