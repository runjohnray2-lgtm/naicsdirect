import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'

// Run the real route against dependency doubles; no Stripe/email/database calls.
function loadTs(path, dependencies = {}, exports = []) {
  const source = stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), 'utf8'))
    .replace(/^import .*$/gm, '')
    .replace(/^export /gm, '')
  return new Function(...Object.keys(dependencies), `${source}\nreturn {${exports.join(',')}}`)(...Object.values(dependencies))
}

const navigation = loadTs('../lib/auth-navigation.ts', {}, ['safeCallbackUrl', 'isSignInConfirmationUrl'])
test('login preserves selected plan and rejects external return destinations', () => {
  assert.equal(navigation.safeCallbackUrl('/pricing?plan=pro'), '/pricing?plan=pro')
  for (const value of ['https://other.example', '//other.example', '/\\other.example', '/\nother.example', null]) {
    assert.equal(navigation.safeCallbackUrl(value), '/dashboard')
  }
})
test('sign-in confirmation accepts only this site’s token callback', () => {
  const origin = 'https://naicsdirect.com'
  assert.equal(navigation.isSignInConfirmationUrl(`${origin}/api/auth/callback/resend?token=test&email=test`, origin), true)
  for (const value of ['javascript:alert(1)', 'https://other.example/api/auth/callback/resend?token=test&email=test', `${origin}/pricing`, `${origin}/api/auth/callback/resend?email=test`]) {
    assert.equal(navigation.isSignInConfirmationUrl(value, origin), false)
  }
})

function alertHarness(count, rejectedBatch = -1) {
  const delivered = new Set()
  let requests = 0, checkpoints = 0, queries = 0
  const now = new Date()
  const bids = Array.from({ length: count }, (_, i) => ({ id: `bid-${i}`, title: `Opportunity ${i}`, niche: 'flooring', solicitationNumber: null, responseDeadline: new Date(now.getTime() + 86400000), uiLink: null }))
  const prisma = {
    user: { findMany: async () => [{ id: 'user-1', email: 'test@example.com', subscription: { selectedNiches: ['flooring'] }, customCategories: [], pursuits: [], notificationPreference: { emailNewPosts: true, smsNewPosts: false, emailDeadlines: false, smsDeadlines: false, deadlineHours: [24], lastNewPostCheckAt: new Date(now.getTime() - 86400000) } }] },
    bid: { findMany: async (query) => { queries++; assert.ok(query.where.syncedAt); return bids } },
    notificationDelivery: {
      findUnique: async ({ where }) => delivered.has(where.userId_bidId_kind_channel_triggerKey.bidId) ? {} : null,
      createMany: async ({ data }) => { data.forEach(row => delivered.add(row.bidId)) },
    },
    notificationPreference: { update: async () => { checkpoints++ } },
  }
  class Resend {
    emails = { send: async () => (++requests === rejectedBatch ? { data: null, error: { message: 'Provider rejected sender' } } : { data: { id: `email-${requests}` }, error: null }) }
  }
  const { GET } = loadTs('../app/api/cron/alerts/route.ts', {
    NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) },
    prisma, Resend, sendSms: async () => ({ sent: true }),
  }, ['GET'])
  return { GET, delivered, stats: () => ({ requests, checkpoints, queries }) }
}

process.env.CRON_SECRET = 'test-only'
process.env.RESEND_API_KEY = 'test-only'
const request = () => new Request('https://example.com/api/cron/alerts', { headers: { authorization: 'Bearer test-only' } })

test('30 matching bids send in two batches, with no unsent bids marked delivered', async () => {
  const h = alertHarness(30)
  const result = await h.GET(request())
  assert.equal(result.status, 200)
  assert.equal(result.body.emailsSent, 2)
  assert.equal(h.delivered.size, 30)
  assert.equal(h.stats().checkpoints, 1)
})
test('rejected email keeps the checkpoint and retries only the remaining batch', async () => {
  const h = alertHarness(30, 2)
  const first = await h.GET(request())
  assert.equal(first.status, 502)
  assert.equal(first.body.success, false)
  assert.equal(h.delivered.size, 25)
  assert.equal(h.stats().checkpoints, 0)
  const retry = await h.GET(request())
  assert.equal(retry.status, 200)
  assert.equal(retry.body.emailsSent, 1)
  assert.equal(h.delivered.size, 30)
  assert.equal(h.stats().checkpoints, 1)
})
test('unauthorized cron requests do not query bids or send alerts', async () => {
  const h = alertHarness(30)
  const result = await h.GET(new Request('https://example.com/api/cron/alerts'))
  assert.equal(result.status, 401)
  assert.deepEqual(h.stats(), { requests: 0, checkpoints: 0, queries: 0 })
})
test('missing cron secret fails closed', async () => {
  delete process.env.CRON_SECRET
  try {
    const h = alertHarness(1)
    assert.equal((await h.GET(request())).status, 401)
    assert.equal(h.stats().requests, 0)
  } finally { process.env.CRON_SECRET = 'test-only' }
})
