export interface Niche {
  id: string
  name: string
  emoji: string
  description: string
  naicsCodes: string[]
  bgClass: string
  colorClass: string
  borderClass: string
  /** Set to false to keep a niche fully functional (sync, dashboard, direct link)
   *  but hidden from the public marketing homepage grid. Used for internal /
   *  example watchlists like Radiantz that shouldn't confuse prospective customers. */
  public?: boolean
}

export const NICHES: Niche[] = [
  {
    id: "flooring",
    name: "Flooring & Tile",
    emoji: "🪵",
    description: "Flooring installation, materials, and related services",
    naicsCodes: ["238330", "442210", "314110", "314120", "314910"],
    bgClass: "bg-amber-900/30",
    colorClass: "text-amber-400",
    borderClass: "border-amber-800",
  },
  {
    id: "janitorial",
    name: "Janitorial Supplies",
    emoji: "🧹",
    description: "Cleaning products, janitorial services, and sanitation supplies",
    naicsCodes: ["561720", "561722", "325612", "325611", "325613"],
    bgClass: "bg-blue-900/30",
    colorClass: "text-blue-400",
    borderClass: "border-blue-800",
  },
  {
    id: "hvac",
    name: "HVAC Equipment",
    emoji: "❄️",
    description: "Heating, ventilation, air conditioning equipment and services",
    naicsCodes: ["238220", "333415", "811310", "423720"],
    bgClass: "bg-cyan-900/30",
    colorClass: "text-cyan-400",
    borderClass: "border-cyan-800",
  },
  {
    id: "furniture",
    name: "Office Furniture",
    emoji: "🪩",
    description: "Office furniture, seating, and workstation solutions",
    naicsCodes: ["337211", "337214", "337122", "337127", "442110"],
    bgClass: "bg-purple-900/30",
    colorClass: "text-purple-400",
    borderClass: "border-purple-800",
  },
  {
    id: "safety",
    name: "Safety & PPE",
    emoji: "🦺",
    description: "Personal protective equipment, safety gear, and supplies",
    naicsCodes: ["339113", "424490", "448190", "339999"],
    bgClass: "bg-orange-900/30",
    colorClass: "text-orange-400",
    borderClass: "border-orange-800",
  },
  {
    id: "electrical",
    name: "Electrical Contractors",
    emoji: "⚡",
    description: "Electrical wiring installation, switchgear, and lighting-adjacent equipment",
    naicsCodes: ["238210", "238290", "335313", "335999"],
    bgClass: "bg-indigo-900/30",
    colorClass: "text-indigo-400",
    borderClass: "border-indigo-800",
  },
  {
    id: "landscaping",
    name: "Landscaping & Grounds",
    emoji: "🌳",
    description: "Landscaping, grounds maintenance, and site preparation services",
    naicsCodes: ["561730", "238910", "444220", "561790"],
    bgClass: "bg-green-900/30",
    colorClass: "text-green-400",
    borderClass: "border-green-800",
  },
  {
    id: "security",
    name: "Security Systems",
    emoji: "🔒",
    description: "Security system installation, surveillance equipment, and guard services",
    naicsCodes: ["561621", "334290", "561612"],
    bgClass: "bg-red-900/30",
    colorClass: "text-red-400",
    borderClass: "border-red-800",
  },
  {
    id: "medical",
    name: "Medical Supplies",
    emoji: "🏥",
    description: "Medical devices, equipment, and healthcare supplies",
    naicsCodes: ["339112", "423450", "621610", "325413", "339114"],
    bgClass: "bg-rose-900/30",
    colorClass: "text-rose-400",
    borderClass: "border-rose-800",
  },
  {
    id: "radiantz",
    name: "Radiantz LED Lighting",
    emoji: "💡",
    description: "Internal watchlist covering all of Radiantz LED Lighting's registered NAICS codes (lighting, fabricated metal, signage, wholesale distribution, and low-hanging-fruit commodity categories)",
    naicsCodes: [
      "315990",
      "332999",
      "335132",
      "339950",
      "423610",
      "423990",
      "423710",
      "423840",
      "423120",
      "561439",
      "561910",
      "611310",
      "611610",
      "611699",
      "713120",
      "812210",
      "812220",
      "812921",
      "812990",
      "813219",
    ],
    bgClass: "bg-yellow-900/30",
    colorClass: "text-yellow-400",
    borderClass: "border-yellow-800",
    public: false,
  },
]

export const NICHE_MAP: Record<string, Niche> = Object.fromEntries(
  NICHES.map((n) => [n.id, n])
)

/** Niches to show on the public marketing homepage / niche picker. */
export const PUBLIC_NICHES: Niche[] = NICHES.filter((n) => n.public !== false)
