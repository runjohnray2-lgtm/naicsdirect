import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { getEntitlement } from "@/lib/entitlement"

export async function getPaidPursuitUserId() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase() ?? null
  let userId = session?.user?.id ?? null

  if (!userId && email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    userId = user?.id ?? null
  }

  if (!userId) return { userId: null, authenticated: false, entitled: false }
  const entitlement = await getEntitlement(userId)
  return { userId, authenticated: true, entitled: entitlement.isGated }
}
