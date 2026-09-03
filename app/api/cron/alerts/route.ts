import { NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/lib/db"
import { sendSms } from "@/lib/sms"

export const maxDuration = 300

function bidLine(bid: { title: string; solicitationNumber: string | null; responseDeadline: Date | null; uiLink: string | null }) {
  const due = bid.responseDeadline ? bid.responseDeadline.toLocaleDateString("en-US") : "No deadline listed"
  return `${bid.title}${bid.solicitationNumber ? ` (${bid.solicitationNumber})` : ""} — due ${due}${bid.uiLink ? ` — ${bid.uiLink}` : ""}`
}

function htmlEscape(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] || char))
}

async function sendEmail(to: string, subject: string, lines: string[]) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ALERT_EMAIL_FROM || "NAICS Direct <alerts@naicsdirect.com>"
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not configured" }
  const resend = new Resend(apiKey)
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111"><h2>${htmlEscape(subject)}</h2><ul>${lines.map(line => `<li style="margin-bottom:10px">${htmlEscape(line)}</li>`).join("")}</ul><p><a href="https://naicsdirect.com/categories">Open My Categories</a></p></div>`
  await resend.emails.send({ from, to, subject, html })
  return { sent: true }
}

type CategoryRule = {
  keywords: string[]
  excludedKeywords: string[]
  naicsCodes: string[]
  states: string[]
  agencies: string[]
  setAsides: string[]
  emailAlerts: boolean
  smsAlerts: boolean
}

type MatchBid = {
  title: string
  naicsCode: string | null
  placeState: string | null
  agency: string | null
  solicitationNumber: string | null
  setAside: string | null
}

function customCategoryMatches(category: CategoryRule, bid: MatchBid) {
  if (category.naicsCodes.length && (!bid.naicsCode || !category.naicsCodes.includes(bid.naicsCode))) return false
  if (category.states.length && (!bid.placeState || !category.states.some(state => state.toLowerCase() === bid.placeState!.toLowerCase()))) return false
  if (category.agencies.length) {
    const agency = (bid.agency || "").toLowerCase()
    if (!category.agencies.some(value => agency.includes(value.toLowerCase()))) return false
  }
  if (category.setAsides.length) {
    const setAside = (bid.setAside || "").toLowerCase()
    if (!category.setAsides.some(value => setAside.includes(value.toLowerCase()))) return false
  }

  const haystack = `${bid.title} ${bid.agency || ""} ${bid.solicitationNumber || ""}`.toLowerCase()
  if (category.keywords.length && !category.keywords.some(keyword => haystack.includes(keyword.toLowerCase()))) return false
  if (category.excludedKeywords.some(keyword => haystack.includes(keyword.toLowerCase()))) return false
  return true
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const fallbackSince = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const users = await prisma.user.findMany({
    where: { notificationPreference: { isNot: null } },
    include: {
      notificationPreference: true,
      subscription: true,
      customCategories: { where: { active: true } },
      pursuits: {
        where: { decision: "PURSUE" },
        include: { bid: true },
      },
    },
  })

  let emailsSent = 0
  let smsSent = 0
  let usersChecked = 0
  const errors: string[] = []

  for (const user of users) {
    const pref = user.notificationPreference
    if (!pref) continue
    usersChecked++
    const since = pref.lastNewPostCheckAt || fallbackSince

    try {
      const recentBids = await prisma.bid.findMany({
        where: {
          active: true,
          postedDate: { gt: since },
        },
        orderBy: { postedDate: "desc" },
        take: 250,
      })

      const selectedNiches = user.subscription?.selectedNiches || []
      const matchingForEmail = recentBids.filter(bid => {
        if (selectedNiches.includes(bid.niche)) return true
        return user.customCategories.some(category => category.emailAlerts && customCategoryMatches(category, bid))
      })
      const matchingForSms = recentBids.filter(bid => {
        if (selectedNiches.includes(bid.niche)) return true
        return user.customCategories.some(category => category.smsAlerts && customCategoryMatches(category, bid))
      })

      if (matchingForEmail.length && pref.emailNewPosts) {
        const unsent = [] as typeof matchingForEmail
        for (const bid of matchingForEmail) {
          const exists = await prisma.notificationDelivery.findUnique({
            where: { userId_bidId_kind_channel_triggerKey: { userId: user.id, bidId: bid.id, kind: "NEW_POST", channel: "EMAIL", triggerKey: "posted" } },
          })
          if (!exists) unsent.push(bid)
        }
        if (unsent.length) {
          const result = await sendEmail(user.email, `${unsent.length} new government bid${unsent.length === 1 ? "" : "s"} matched your feed`, unsent.slice(0, 25).map(bidLine))
          if (result.sent) {
            emailsSent++
            await prisma.notificationDelivery.createMany({
              data: unsent.map(bid => ({ userId: user.id, bidId: bid.id, kind: "NEW_POST", channel: "EMAIL", triggerKey: "posted" })),
              skipDuplicates: true,
            })
          }
        }
      }

      if (matchingForSms.length && pref.smsNewPosts && pref.phone) {
        const unsent = [] as typeof matchingForSms
        for (const bid of matchingForSms) {
          const exists = await prisma.notificationDelivery.findUnique({
            where: { userId_bidId_kind_channel_triggerKey: { userId: user.id, bidId: bid.id, kind: "NEW_POST", channel: "SMS", triggerKey: "posted" } },
          })
          if (!exists) unsent.push(bid)
        }
        if (unsent.length) {
          const body = `NAICS Direct: ${unsent.length} new matching bid${unsent.length === 1 ? "" : "s"}. ${unsent[0].title.slice(0, 100)}. Open: https://naicsdirect.com/categories`
          const result = await sendSms(pref.phone, body)
          if (result.sent) {
            smsSent++
            await prisma.notificationDelivery.createMany({
              data: unsent.map(bid => ({ userId: user.id, bidId: bid.id, kind: "NEW_POST", channel: "SMS", triggerKey: "posted" })),
              skipDuplicates: true,
            })
          }
        }
      }

      for (const pursuit of user.pursuits) {
        const deadline = pursuit.bid.responseDeadline
        if (!deadline || deadline <= now) continue
        const hoursLeft = (deadline.getTime() - now.getTime()) / 3600000

        for (const threshold of pref.deadlineHours) {
          if (hoursLeft > threshold || hoursLeft <= threshold - 24) continue
          const triggerKey = `${threshold}h`

          if (pref.emailDeadlines) {
            const exists = await prisma.notificationDelivery.findUnique({
              where: { userId_bidId_kind_channel_triggerKey: { userId: user.id, bidId: pursuit.bid.id, kind: "DEADLINE", channel: "EMAIL", triggerKey } },
            })
            if (!exists) {
              const result = await sendEmail(user.email, `Bid deadline reminder: ${pursuit.bid.title}`, [bidLine(pursuit.bid)])
              if (result.sent) {
                emailsSent++
                await prisma.notificationDelivery.create({ data: { userId: user.id, bidId: pursuit.bid.id, kind: "DEADLINE", channel: "EMAIL", triggerKey } })
              }
            }
          }

          if (pref.smsDeadlines && pref.phone) {
            const exists = await prisma.notificationDelivery.findUnique({
              where: { userId_bidId_kind_channel_triggerKey: { userId: user.id, bidId: pursuit.bid.id, kind: "DEADLINE", channel: "SMS", triggerKey } },
            })
            if (!exists) {
              const result = await sendSms(pref.phone, `NAICS Direct deadline: ${pursuit.bid.title.slice(0, 110)} is due ${deadline.toLocaleDateString("en-US")}. https://naicsdirect.com/pursuits`)
              if (result.sent) {
                smsSent++
                await prisma.notificationDelivery.create({ data: { userId: user.id, bidId: pursuit.bid.id, kind: "DEADLINE", channel: "SMS", triggerKey } })
              }
            }
          }
        }
      }

      await prisma.notificationPreference.update({ where: { userId: user.id }, data: { lastNewPostCheckAt: now } })
    } catch (error) {
      errors.push(`${user.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return NextResponse.json({ success: true, usersChecked, emailsSent, smsSent, errors: errors.slice(0, 20), checkedAt: now.toISOString() })
}
