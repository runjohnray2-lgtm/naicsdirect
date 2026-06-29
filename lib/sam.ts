export interface SamOpportunity {
  noticeId: string
  title: string
  solicitationNumber?: string
  fullParentPathName?: string
  postedDate?: string
  responseDeadLine?: string
  naicsCode?: string
  type?: string
  typeOfSetAsideDescription?: string
  uiLink?: string
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
  apiKey: string
): Promise<SamOpportunity[]> {
  const params = new URLSearchParams({
    api_key: apiKey,
    limit: "100",
    offset: "0",
    postedFrom,
    postedTo,
    naicsCode,
    ptype: "o,k,p",
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
    return (data.opportunitiesData ?? []) as SamOpportunity[]
  } catch (err) {
    console.error(`SAM fetch failed for NAICS ${naicsCode}:`, err)
    return []
  }
}
