export interface Niche {
  id: string
  name: string
  emoji: string
  description: string
  naics: string[]
  searchTerms: string[]
  colorClass: string
  bgClass: string
  borderClass: string
}

export const NICHES: Niche[] = [
  {
    id: "flooring",
    name: "Flooring & Tile",
    emoji: "🪵",
    description: "Carpet, hardwood, tile, vinyl, and flooring installation contracts",
    naics: ["238330", "442210", "423390"],
    searchTerms: ["flooring", "carpet", "tile installation"],
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
  },
  {
    id: "janitorial",
    name: "Janitorial Supplies",
    emoji: "🧹",
    description: "Cleaning supplies, sanitation products, and janitorial equipment",
    naics: ["423850", "561720", "325612"],
    searchTerms: ["janitorial", "cleaning supplies", "sanitation"],
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
  },
  {
    id: "hvac",
    name: "HVAC Equipment",
    emoji: "❄️",
    description: "Heating, ventilation, air conditioning parts and equipment",
    naics: ["423730", "238220", "333415"],
    searchTerms: ["HVAC", "heating cooling", "air conditioning"],
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
  },
  {
    id: "furniture",
    name: "Office Furniture",
    emoji: "🪑",
    description: "Desks, chairs, filing systems, and workspace furnishings",
    naics: ["337211", "423210", "337214"],
    searchTerms: ["office furniture", "seating", "workstation"],
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
  },
  {
    id: "safety",
    name: "Safety & PPE",
    emoji: "🦺",
    description: "Personal protective equipment, safety gear, and compliance products",
    naics: ["339113", "423450", "339999"],
    searchTerms: ["safety equipment", "PPE", "protective gear"],
    colorClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/30",
  },
  {
    id: "automotive",
    name: "Automotive Parts",
    emoji: "🔧",
    description: "Vehicle parts, fleet maintenance supplies, and automotive components",
    naics: ["423120", "441310", "336390"],
    searchTerms: ["vehicle parts", "automotive", "fleet maintenance"],
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
  },
  {
    id: "foodservice",
    name: "Food Service Equipment",
    emoji: "🍽️",
    description: "Commercial kitchen equipment, cafeteria supplies, and food service items",
    naics: ["423440", "333318", "311999"],
    searchTerms: ["food service", "kitchen equipment", "cafeteria"],
    colorClass: "text-green-400",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/30",
  },
  {
    id: "medical",
    name: "Medical Supplies",
    emoji: "🏥",
    description: "Non-clinical medical supplies, equipment, and healthcare products",
    naics: ["423450", "339112", "424210"],
    searchTerms: ["medical supplies", "healthcare equipment", "clinical supplies"],
    colorClass: "text-pink-400",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/30",
  },
]

export function getNicheById(id: string): Niche | undefined {
  return NICHES.find(n => n.id === id)
}
