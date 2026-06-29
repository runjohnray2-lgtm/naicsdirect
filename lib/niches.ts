export interface Niche {
  id: string
  label: string
  emoji: string
  description: string
  naicsCodes: string[]
}

export const NICHES: Niche[] = [
  {
    id: "flooring",
    label: "Flooring & Tile",
    emoji: "🪵",
    description: "Flooring installation, materials, and related services",
    naicsCodes: ["238330", "442210", "314110", "314120", "314910"],
  },
  {
    id: "janitorial",
    label: "Janitorial Supplies",
    emoji: "🧹",
    description: "Cleaning products, janitorial services, and sanitation supplies",
    naicsCodes: ["561720", "561722", "325612", "325611", "325613"],
  },
  {
    id: "hvac",
    label: "HVAC Equipment",
    emoji: "❄️",
    description: "Heating, ventilation, air conditioning equipment and services",
    naicsCodes: ["238220", "333415", "811310", "423720", "238210"],
  },
  {
    id: "furniture",
    label: "Office Furniture",
    emoji: "🪑",
    description: "Office furniture, seating, and workstation solutions",
    naicsCodes: ["337211", "337214", "337122", "337127", "442110"],
  },
  {
    id: "safety",
    label: "Safety & PPE",
    emoji: "🦺",
    description: "Personal protective equipment, safety gear, and supplies",
    naicsCodes: ["339113", "424490", "561621", "448190", "339999"],
  },
  {
    id: "automotive",
    label: "Automotive Parts",
    emoji: "🔧",
    description: "Vehicle parts, accessories, and automotive services",
    naicsCodes: ["441310", "811111", "811112", "336211", "423120"],
  },
  {
    id: "foodservice",
    label: "Food Service Equipment",
    emoji: "🍽️",
    description: "Commercial kitchen equipment, food service supplies",
    naicsCodes: ["333318", "423850", "722310", "311812", "311813"],
  },
  {
    id: "medical",
    label: "Medical Supplies",
    emoji: "🏥",
    description: "Medical devices, equipment, and healthcare supplies",
    naicsCodes: ["339112", "423450", "621610", "325413", "339114"],
  },
]

export const NICHE_MAP: Record<string, Niche> = Object.fromEntries(
  NICHES.map((n) => [n.id, n])
)
