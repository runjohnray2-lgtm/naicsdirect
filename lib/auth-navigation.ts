/** Keep post-login navigation on this site, including the chosen plan. */
export function safeCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) {
    return "/dashboard"
  }
  return value
}

export function isSignInConfirmationUrl(value: string | null, origin: string): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.origin === origin && url.pathname === "/api/auth/callback/resend" &&
      !!url.searchParams.get("token") && !!url.searchParams.get("email")
  } catch {
    return false
  }
}
