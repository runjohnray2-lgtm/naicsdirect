type Coordinates = { lat: number; lon: number }

export interface LocalSupplierResult {
  sourceId: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  website: string | null
  distanceMiles: number | null
}

const TAG_FILTERS: Record<string, string[]> = {
  flooring: [
    '["craft"="floorer"]',
    '["shop"="flooring"]',
    '["shop"="tiles"]',
  ],
  janitorial: [
    '["craft"="cleaning"]',
    '["shop"="cleaning"]',
  ],
  hvac: [
    '["craft"="hvac"]',
    '["shop"="heating"]',
  ],
  furniture: [
    '["shop"="furniture"]',
    '["shop"="office_supplies"]',
  ],
  safety: [
    '["shop"="workwear"]',
    '["shop"="trade"]',
  ],
  electrical: [
    '["craft"="electrician"]',
    '["shop"="electrical"]',
  ],
  landscaping: [
    '["craft"="gardener"]',
    '["craft"="landscaper"]',
    '["shop"="garden_centre"]',
  ],
  security: [
    '["shop"="security"]',
    '["craft"="security"]',
  ],
  medical: [
    '["shop"="medical_supply"]',
    '["shop"="chemist"]',
  ],
  hardware: [
    '["shop"="hardware"]',
    '["shop"="trade"]',
  ],
  "industrial-equipment": [
    '["shop"="trade"]',
    '["industrial"]',
  ],
  "office-supplies": [
    '["shop"="office_supplies"]',
    '["shop"="stationery"]',
  ],
  "signs-printing": [
    '["shop"="copyshop"]',
    '["craft"="signmaker"]',
    '["shop"="printing"]',
  ],
  "vehicle-parts": [
    '["shop"="car_parts"]',
    '["shop"="tyres"]',
    '["shop"="truck"]',
  ],
  "waste-services": [
    '["amenity"="waste_transfer_station"]',
    '["amenity"="recycling"]',
  ],
}

function haversineMiles(a: Coordinates, b: Coordinates) {
  const earthRadiusMiles = 3958.8
  const toRad = (value: number) => value * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

async function geocode(city: string, state: string, zip?: string | null): Promise<Coordinates | null> {
  const query = [city, state, zip, "USA"].filter(Boolean).join(", ")
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "us",
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      "User-Agent": "NAICSDirect/1.0 (supplier discovery; contact: ray@radiantz.com)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  })
  if (!response.ok) return null
  const rows = await response.json() as Array<{ lat: string; lon: string }>
  if (!rows[0]) return null
  const lat = Number(rows[0].lat)
  const lon = Number(rows[0].lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { lat, lon }
}

function tag(tags: Record<string, string> | undefined, ...keys: string[]) {
  if (!tags) return null
  for (const key of keys) {
    if (tags[key]) return tags[key]
  }
  return null
}

function addressFromTags(tags: Record<string, string> | undefined) {
  if (!tags) return null
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ")
  const locality = [tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", ")
  return [street, locality].filter(Boolean).join(", ") || null
}

export async function discoverLocalSuppliers(input: {
  niche: string
  city: string
  state: string
  zip?: string | null
  radiusMiles?: number
}): Promise<LocalSupplierResult[]> {
  const center = await geocode(input.city, input.state, input.zip)
  if (!center) return []

  const filters = TAG_FILTERS[input.niche] || ['["shop"]', '["craft"]']
  const radiusMeters = Math.round((input.radiusMiles ?? 30) * 1609.344)
  const statements = filters.flatMap(filter => [
    `node${filter}(around:${radiusMeters},${center.lat},${center.lon});`,
    `way${filter}(around:${radiusMeters},${center.lat},${center.lon});`,
    `relation${filter}(around:${radiusMeters},${center.lat},${center.lon});`,
  ]).join("\n")

  const query = `[out:json][timeout:20];(\n${statements}\n);out center tags;`
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "NAICSDirect/1.0 (supplier discovery; contact: ray@radiantz.com)",
    },
    body: new URLSearchParams({ data: query }),
    cache: "no-store",
  })
  if (!response.ok) return []

  const payload = await response.json() as {
    elements?: Array<{
      type: string
      id: number
      lat?: number
      lon?: number
      center?: { lat?: number; lon?: number }
      tags?: Record<string, string>
    }>
  }

  const seen = new Set<string>()
  const results: LocalSupplierResult[] = []
  for (const element of payload.elements || []) {
    const name = tag(element.tags, "name", "brand", "operator")
    if (!name) continue

    const lat = element.lat ?? element.center?.lat
    const lon = element.lon ?? element.center?.lon
    const dedupe = `${name.toLowerCase()}|${tag(element.tags, "addr:street") || ""}`
    if (seen.has(dedupe)) continue
    seen.add(dedupe)

    results.push({
      sourceId: `${element.type}:${element.id}`,
      name,
      address: addressFromTags(element.tags),
      city: tag(element.tags, "addr:city") || input.city,
      state: tag(element.tags, "addr:state") || input.state,
      phone: tag(element.tags, "contact:phone", "phone"),
      email: tag(element.tags, "contact:email", "email"),
      website: tag(element.tags, "contact:website", "website"),
      distanceMiles: typeof lat === "number" && typeof lon === "number"
        ? Math.round(haversineMiles(center, { lat, lon }) * 10) / 10
        : null,
    })
  }

  return results
    .sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999))
    .slice(0, 25)
}
