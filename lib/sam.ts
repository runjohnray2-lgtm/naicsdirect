export interface SamOpportunity {
  noticeId: string
  title: string
  solicitationNumber?: string
  fullParentPathName?: string
  postedDate?: string
  modifiedDate?: string
  responseDeadLine?: string
  naicsCode?: string
  classificationCode?: string
  type?: string
  baseType?: string
  typeOfSetAsideDescription?: string
  uiLink?: string
  placeOfPerformance?: {
    streetAddress?: string
    streetAddress2?: string
    city?: { code?: string; name?: string }
    state?: { code?: string; name?: string }
    country?: { code?: string; name?: string }
    zip?: string
  }
}

export function formatSamDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${mm}/${dd}/${date.getFullYear()}`
}

export async function fetchOpportunitiesByNaics(
  naicsCode: string,
  postedFrom: string,
  postedTo: string,
  apiKey: string,
  noticeTypes = "o,k,p"
): Promise<SamOpportunity[]> {
  const params = new URLSearchParams({
    api_key: apiKey,
    limit: "100",
    offset: "0",
    postedFrom,
    postedTo,
    ncode: naicsCode,
    ptype: noticeTypes,
  })

  try {
    const res = await fetch(
      `https://api.sam.gov/opportunities/v2/search?${params}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.error(`SAM API error for NAICS ${naicsCode}: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    const opportunities = (data.opportunitiesData ?? []) as SamOpportunity[]
    // Defense-in-depth: explicitly verify the NAICS because SAM has previously
    // returned unfiltered results when a request parameter was not recognized.
    return opportunities.filter((o) => o.naicsCode === naicsCode)
  } catch (err) {
    console.error(`SAM fetch failed for NAICS ${naicsCode}:`, err)
    return []
  }
}
