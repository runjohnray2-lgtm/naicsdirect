export async function sendSms(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !from) {
    return { sent: false, reason: "SMS provider not configured" }
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body })
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`SMS delivery failed: ${response.status} ${text.slice(0, 200)}`)
  }

  return { sent: true }
}
