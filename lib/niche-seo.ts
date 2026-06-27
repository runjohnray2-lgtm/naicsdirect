export interface NicheSEO {
  slug: string
  title: string
  metaDescription: string
  h1: string
  subtitle: string
  intro: string
  naicsCodes: { code: string; description: string }[]
  benefits: string[]
  faqs: { q: string; a: string }[]
  keywords: string[]
}

export const NICHE_SEO: Record<string, NicheSEO> = {
  flooring: {
    slug: "flooring",
    title: "Federal Flooring Contracts | NAICS 238330 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal flooring and tile installation contracts on SAM.gov. NAICS Direct filters carpet, hardwood, vinyl, and tile bids by NAICS 238330, 442210, 423390. Free to browse.",
    h1: "Federal Flooring & Tile Contracts",
    subtitle:
      "NAICS-filtered government bids for carpet, hardwood, vinyl, and tile installation contractors",
    intro:
      "The federal government spends hundreds of millions annually on flooring installation, replacement, and maintenance across military bases, VA hospitals, federal office buildings, and courthouses. If your business installs carpet, hardwood, LVT, ceramic tile, or commercial vinyl, there are active federal solicitations open right now — and most flooring contractors never find them because SAM.gov buries them under thousands of irrelevant results. NAICS Direct pre-filters every open solicitation to NAICS codes 238330, 442210, and 423390 so you see only flooring bids.",
    naicsCodes: [
      { code: "238330", description: "Flooring Contractors — installation of all floor covering types" },
      { code: "442210", description: "Floor Covering Stores — supply and distribution of floor materials" },
      { code: "423390", description: "Other Construction Material Merchant Wholesalers — flooring wholesale" },
    ],
    benefits: [
      "See only flooring-relevant bids — no noise from unrelated industries",
      "Real-time deadlines with urgency alerts so you never miss a closing date",
      "Filter by agency: VA, Army Corps, GSA, DoD, and more",
      "One-click access to the full solicitation on SAM.gov",
      "Email alerts when new flooring bids post (Pro/Elite plans)",
    ],
    faqs: [
      {
        q: "What NAICS code is used for federal flooring contracts?",
        a: "Most federal flooring installation contracts fall under NAICS 238330 (Flooring Contractors). Wholesale and supply contracts may use 442210 or 423390. NAICS Direct monitors all three.",
      },
      {
        q: "How do I find government flooring contracts on SAM.gov?",
        a: "Go to SAM.gov, search 'flooring', and filter by NAICS 238330. Or use NAICS Direct — we do that filtering automatically and show only open, active bids with real-time deadlines.",
      },
      {
        q: "Are small businesses competitive for federal flooring contracts?",
        a: "Yes. Many flooring solicitations are set aside exclusively for small businesses under SBA size standards for NAICS 238330 (currently $19M average annual receipts). Service-Disabled Veteran-Owned, 8(a), and HUBZone firms have additional set-aside advantages.",
      },
      {
        q: "What agencies buy the most flooring services?",
        a: "The Department of Veterans Affairs (VA), General Services Administration (GSA), Army Corps of Engineers, and Department of Defense facilities are the largest buyers of flooring installation services.",
      },
      {
        q: "Is NAICS Direct free to use?",
        a: "Yes — the free tier lets you browse all active flooring bids. Pro ($14/month) and Elite ($29/month) plans add real-time email alerts and saved searches.",
      },
    ],
    keywords: [
      "federal flooring contracts",
      "government flooring bids",
      "NAICS 238330 contracts",
      "SAM.gov flooring",
      "carpet installation government contract",
      "tile installation federal bid",
      "flooring contractor government work",
    ],
  },

  janitorial: {
    slug: "janitorial",
    title: "Federal Janitorial Contracts | NAICS 561720 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal janitorial and cleaning supply contracts. NAICS Direct filters SAM.gov bids by NAICS 561720, 423850, 325612 for cleaning companies and supply distributors. Free.",
    h1: "Federal Janitorial & Cleaning Contracts",
    subtitle:
      "Government bids for janitorial services, cleaning supplies, and sanitation products",
    intro:
      "Federal buildings, military installations, VA medical centers, and courthouses require ongoing janitorial services and cleaning supplies — creating a steady stream of government contracts for cleaning companies and supply distributors. These are recurring revenue opportunities with multi-year base periods. NAICS Direct filters SAM.gov to show only janitorial and cleaning-related solicitations, so you stop wasting time on bids that have nothing to do with your business.",
    naicsCodes: [
      { code: "561720", description: "Janitorial Services — building cleaning and maintenance services" },
      { code: "423850", description: "Service Establishment Equipment & Supplies Merchant Wholesalers — cleaning supply distribution" },
      { code: "325612", description: "Polish and Other Sanitation Good Manufacturing — cleaning product manufacturing" },
    ],
    benefits: [
      "Recurring contract opportunities — many janitor bids are multi-year base + option years",
      "Filter by set-aside type (small business, 8(a), WOSB, SDVOSB)",
      "Real-time deadline tracking so you never miss a closing date",
      "Covers both service contracts and supply procurement",
      "Email alerts when new janitorial bids post (Pro/Elite plans)",
    ],
    faqs: [
      {
        q: "What NAICS code is used for janitorial service government contracts?",
        a: "Federal janitorial service contracts typically use NAICS 561720 (Janitorial Services). Supply contracts may use 423850. NAICS Direct monitors both.",
      },
      {
        q: "How do I bid on government cleaning contracts?",
        a: "You need an active SAM.gov registration, a CAGE code, and to meet the size standard for NAICS 561720 (currently $22.5M average annual receipts for most). NAICS Direct shows you active solicitations — click any bid to access the full package on SAM.gov.",
      },
      {
        q: "Are janitorial government contracts competitive?",
        a: "They are competitive but accessible for small businesses. Many are set aside for small businesses or specific certifications. Key differentiators include past performance, bonding, and competitive pricing on the Performance Work Statement.",
      },
      {
        q: "What's the difference between a janitorial service contract and a supplies contract?",
        a: "Service contracts (NAICS 561720) pay you to perform cleaning at a government location. Supply contracts (NAICS 423850) pay you to deliver cleaning products and equipment. NAICS Direct shows both.",
      },
      {
        q: "Is NAICS Direct free to use?",
        a: "Yes — free tier lets you browse all active janitorial bids. Paid plans ($14-$49/month) add email alerts and expanded features.",
      },
    ],
    keywords: [
      "federal janitorial contracts",
      "government cleaning contracts",
      "NAICS 561720 bids",
      "SAM.gov janitorial",
      "cleaning company government contract",
      "federal building cleaning bid",
    ],
  },

  hvac: {
    slug: "hvac",
    title: "Federal HVAC Contracts | NAICS 238220 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal HVAC installation, maintenance, and equipment contracts. NAICS Direct filters SAM.gov bids by NAICS 238220, 423730, 333415. Free to browse.",
    h1: "Federal HVAC Contracts",
    subtitle:
      "Government bids for heating, ventilation, air conditioning installation and equipment",
    intro:
      "The federal government maintains thousands of facilities requiring HVAC installation, maintenance, and equipment replacement — from Air Force hangars to VA clinic systems. HVAC contracts are among the most consistent and high-value federal opportunities for mechanical contractors and equipment distributors. NAICS Direct filters SAM.gov to show only HVAC-relevant solicitations across NAICS codes 238220, 423730, and 333415.",
    naicsCodes: [
      { code: "238220", description: "Plumbing, Heating, and Air-Conditioning Contractors — installation and maintenance" },
      { code: "423730", description: "Warm Air Heating and Air-Conditioning Equipment Merchant Wholesalers" },
      { code: "333415", description: "Air-Conditioning and Warm Air Heating Equipment Manufacturing" },
    ],
    benefits: [
      "High-value contracts — HVAC projects often range from $50K to $5M+",
      "Multi-year maintenance contracts for stable recurring revenue",
      "Covers installation, repair, and equipment supply solicitations",
      "Filter by agency, location, and set-aside type",
      "Email alerts when new HVAC bids post (Pro/Elite plans)",
    ],
    faqs: [
      {
        q: "What NAICS code covers federal HVAC contracts?",
        a: "NAICS 238220 covers plumbing, heating, and air-conditioning contractors. Equipment and parts distributors typically use 423730. NAICS Direct monitors all HVAC-relevant codes.",
      },
      {
        q: "Do I need special certifications for federal HVAC contracts?",
        a: "Most require an active SAM.gov registration, CAGE code, and proper licensing for the state of performance. Some DoD facilities require additional security clearances or facility access requirements.",
      },
      {
        q: "What agencies buy the most HVAC services?",
        a: "The Department of Defense (Army, Navy, Air Force), VA, and GSA Public Buildings Service are the largest buyers. GSA IDIQ vehicles like SATOC (Small Business HVAC) are also major contract vehicles.",
      },
      {
        q: "How long do federal HVAC contracts typically last?",
        a: "Most HVAC service contracts have a 1-year base period with 4 option years (totaling 5 years). Equipment installation projects may be single-award fixed-price contracts.",
      },
    ],
    keywords: [
      "federal HVAC contracts",
      "government HVAC bids",
      "NAICS 238220 contracts",
      "SAM.gov HVAC",
      "HVAC government contractor",
      "federal air conditioning contract",
    ],
  },

  furniture: {
    slug: "furniture",
    title: "Federal Office Furniture Contracts | NAICS 337211 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal office furniture and workstation contracts. NAICS Direct filters SAM.gov bids by NAICS 337211, 423210, 337214 for furniture dealers and manufacturers. Free.",
    h1: "Federal Office Furniture Contracts",
    subtitle:
      "Government bids for desks, chairs, workstations, filing systems, and workspace furnishings",
    intro:
      "Every federal agency, courthouse, military installation, and VA facility needs office furniture — and they procure it through competitive solicitations on SAM.gov. The federal government is one of the largest institutional furniture buyers in the world, spending over $2 billion annually on office furnishings. NAICS Direct surfaces these opportunities filtered to NAICS 337211, 423210, and 337214 so furniture dealers and manufacturers see only relevant bids.",
    naicsCodes: [
      { code: "337211", description: "Wood Office Furniture Manufacturing" },
      { code: "423210", description: "Furniture Merchant Wholesalers — office furniture distribution" },
      { code: "337214", description: "Office Furniture (Except Wood) Manufacturing" },
    ],
    benefits: [
      "Access to GSA Schedule furniture orders and open market bids",
      "Covers both new furniture procurement and refurbishment contracts",
      "Filter by agency, dollar value, and set-aside type",
      "Real-time closing deadline alerts",
      "Email notifications for new furniture solicitations (Pro/Elite)",
    ],
    faqs: [
      {
        q: "What NAICS code is used for government furniture contracts?",
        a: "Wood furniture manufacturing uses NAICS 337211, non-wood office furniture uses 337214, and wholesale dealers typically use 423210. GSA Schedule orders also flow through these codes.",
      },
      {
        q: "Do I need a GSA Schedule to sell furniture to the government?",
        a: "Not necessarily. Many agencies issue open market solicitations under the micro-purchase threshold ($10K) or simplified acquisition procedures ($250K) that don't require a GSA Schedule. NAICS Direct shows all solicitation types.",
      },
      {
        q: "What agencies buy the most office furniture?",
        a: "GSA (for building fit-outs), DoD (for offices on military installations), VA (for medical offices), and federal courts are the biggest buyers.",
      },
    ],
    keywords: [
      "federal office furniture contracts",
      "government furniture bids",
      "NAICS 337211 contracts",
      "SAM.gov furniture",
      "office furniture government contract",
    ],
  },

  safety: {
    slug: "safety",
    title: "Federal Safety & PPE Contracts | NAICS 339113 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal safety equipment and PPE contracts. NAICS Direct filters SAM.gov bids by NAICS 339113, 423450, 339999 for safety suppliers and PPE distributors. Free.",
    h1: "Federal Safety & PPE Contracts",
    subtitle:
      "Government bids for personal protective equipment, safety gear, and compliance products",
    intro:
      "Federal agencies, military branches, and VA facilities require a constant supply of personal protective equipment, safety products, and compliance gear. From hard hats and fall protection to chemical-resistant gloves and eyewear, the government procures safety equipment year-round. NAICS Direct filters SAM.gov to show only safety and PPE solicitations — no noise, just relevant bids.",
    naicsCodes: [
      { code: "339113", description: "Surgical and Medical Instrument Manufacturing — PPE including gloves, masks, eyewear" },
      { code: "423450", description: "Medical, Dental, and Hospital Equipment Merchant Wholesalers — PPE distribution" },
      { code: "339999", description: "All Other Miscellaneous Manufacturing — safety and protective equipment" },
    ],
    benefits: [
      "Covers PPE, fall protection, fire safety, and industrial safety equipment",
      "TAA-compliant product filtering guidance (required for DoD/State Dept contracts)",
      "Real-time deadline tracking and urgency alerts",
      "Filter by set-aside type for small business advantages",
      "Email alerts for new safety bids (Pro/Elite plans)",
    ],
    faqs: [
      {
        q: "What NAICS code covers federal PPE and safety equipment contracts?",
        a: "NAICS 339113 covers PPE manufacturing, 423450 covers distribution, and 339999 covers miscellaneous safety equipment. DoD safety contracts often also reference FSC (Federal Supply Classification) codes.",
      },
      {
        q: "Does PPE sold to the federal government need to be TAA compliant?",
        a: "Yes, for most DoD and State Department contracts. The Trade Agreements Act (TAA) requires products to be manufactured in the U.S. or a designated country. China-manufactured goods are generally disqualifying.",
      },
      {
        q: "How do I find PPE government contracts?",
        a: "Register on SAM.gov, then use NAICS Direct to monitor 339113, 423450, and 339999 solicitations filtered for you automatically.",
      },
    ],
    keywords: [
      "federal PPE contracts",
      "government safety equipment bids",
      "NAICS 339113 contracts",
      "SAM.gov PPE",
      "safety gear government contract",
    ],
  },

  automotive: {
    slug: "automotive",
    title: "Federal Automotive Parts Contracts | NAICS 423120 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal automotive and fleet parts contracts. NAICS Direct filters SAM.gov bids by NAICS 423120, 441310, 336390 for auto parts suppliers and fleet maintenance companies.",
    h1: "Federal Automotive & Fleet Parts Contracts",
    subtitle:
      "Government bids for vehicle parts, fleet maintenance supplies, and automotive components",
    intro:
      "The federal government operates one of the largest vehicle fleets in the world — from USPS mail trucks to military Humvees to GSA motor pool sedans. Keeping those fleets running requires a constant supply of parts, maintenance supplies, and replacement components. NAICS Direct surfaces federal automotive and fleet parts solicitations filtered to NAICS 423120, 441310, and 336390.",
    naicsCodes: [
      { code: "423120", description: "Motor Vehicle Supplies and New Parts Merchant Wholesalers" },
      { code: "441310", description: "Automotive Parts and Accessories Stores" },
      { code: "336390", description: "Other Motor Vehicle Parts Manufacturing" },
    ],
    benefits: [
      "Access to DoD, USPS, GSA fleet, and civilian agency vehicle contracts",
      "Parts, accessories, tires, and maintenance supply solicitations",
      "Covers NSN (National Stock Number) supply contracts",
      "Real-time deadline tracking and urgency alerts",
      "Email alerts for new automotive bids (Pro/Elite plans)",
    ],
    faqs: [
      {
        q: "What NAICS code is used for federal automotive parts contracts?",
        a: "NAICS 423120 covers motor vehicle parts wholesale. Manufacturing uses 336390. NAICS Direct monitors all automotive-relevant codes including DLA (Defense Logistics Agency) supply contracts.",
      },
      {
        q: "Does the government buy NSN parts from small businesses?",
        a: "Yes. DLA (Defense Logistics Agency) is a major buyer of NSN parts through solicitations that small businesses can bid on. Registration on SAM.gov and sometimes DIBBS (DLA Internet Bid Board System) is required.",
      },
    ],
    keywords: [
      "federal automotive parts contracts",
      "government fleet parts bids",
      "NAICS 423120 contracts",
      "DLA automotive parts",
      "SAM.gov vehicle parts",
    ],
  },

  foodservice: {
    slug: "foodservice",
    title: "Federal Food Service Equipment Contracts | NAICS 423440 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal food service and commercial kitchen equipment contracts. NAICS Direct filters SAM.gov bids by NAICS 423440, 333318 for food service distributors and manufacturers.",
    h1: "Federal Food Service Equipment Contracts",
    subtitle:
      "Government bids for commercial kitchen equipment, cafeteria supplies, and food service items",
    intro:
      "Military dining facilities (DFACs), VA hospital cafeterias, federal prison kitchens, and government cafeterias require a continuous supply of commercial kitchen equipment, serving supplies, and food service products. These contracts range from single-purchase equipment buys to multi-year supply agreements. NAICS Direct filters SAM.gov food service solicitations so you see only relevant bids.",
    naicsCodes: [
      { code: "423440", description: "Restaurant and Hotel Equipment and Supplies Merchant Wholesalers" },
      { code: "333318", description: "Other Commercial and Service Industry Machinery Manufacturing — commercial kitchen equipment" },
      { code: "311999", description: "All Other Food Manufacturing — specialty food products" },
    ],
    benefits: [
      "Military dining facility (DFAC) and VA cafeteria equipment contracts",
      "Covers equipment, smallwares, and supply solicitations",
      "Filter by agency: DoD, VA, BOP (Bureau of Prisons), USDA",
      "Real-time closing deadline alerts",
      "Email notifications for new food service bids (Pro/Elite)",
    ],
    faqs: [
      {
        q: "What NAICS code covers government food service equipment contracts?",
        a: "NAICS 423440 covers restaurant and hotel equipment wholesale. Commercial kitchen manufacturing uses 333318. NAICS Direct monitors both for federal solicitations.",
      },
      {
        q: "Which agencies buy the most food service equipment?",
        a: "The Department of Defense (DFAC/dining facilities), Department of Veterans Affairs (hospital cafeterias), and Bureau of Prisons are the largest federal food service equipment buyers.",
      },
    ],
    keywords: [
      "federal food service contracts",
      "government kitchen equipment bids",
      "NAICS 423440 contracts",
      "SAM.gov food service",
      "military dining equipment contract",
    ],
  },

  medical: {
    slug: "medical",
    title: "Federal Medical Supply Contracts | NAICS 423450 Bid Opportunities | NAICS Direct",
    metaDescription:
      "Find active federal medical and healthcare supply contracts. NAICS Direct filters SAM.gov bids by NAICS 423450, 339112, 424210 for medical supply distributors and manufacturers.",
    h1: "Federal Medical Supply Contracts",
    subtitle:
      "Government bids for non-clinical medical supplies, healthcare equipment, and pharmaceutical products",
    intro:
      "The federal government is the largest single buyer of medical supplies in the world — through the VA, DoD, Indian Health Service, and Bureau of Prisons. These contracts range from bandages and exam gloves to diagnostic equipment and hospital beds. NAICS Direct surfaces federal medical supply solicitations filtered to NAICS 423450, 339112, and 424210 — showing only relevant bids for medical supply distributors and manufacturers.",
    naicsCodes: [
      { code: "423450", description: "Medical, Dental, and Hospital Equipment Merchant Wholesalers" },
      { code: "339112", description: "Surgical and Medical Instrument Manufacturing" },
      { code: "424210", description: "Drugs and Druggists' Sundries Merchant Wholesalers" },
    ],
    benefits: [
      "VA, DoD, IHS, and BOP medical supply contracts",
      "Covers equipment, disposables, and pharmaceutical supply solicitations",
      "TAA-compliance filter guidance for DoD contracts",
      "Real-time deadline tracking and urgency alerts",
      "Email alerts for new medical supply bids (Pro/Elite plans)",
    ],
    faqs: [
      {
        q: "What NAICS code covers federal medical supply contracts?",
        a: "NAICS 423450 covers medical equipment wholesale, 339112 covers manufacturing, and 424210 covers pharmaceutical distribution. NAICS Direct monitors all three.",
      },
      {
        q: "Does medical equipment sold to the federal government need to be FDA cleared?",
        a: "For devices intended for use on patients, yes — FDA 510(k) clearance or equivalent is typically required. Non-clinical supplies (gloves, bandages, furniture) have less stringent requirements.",
      },
      {
        q: "What's the best contract vehicle for selling medical supplies to the VA?",
        a: "VA FSS (Federal Supply Schedule) 65IB is the primary vehicle for medical/surgical supplies. Open market solicitations also appear on SAM.gov for smaller purchases. NAICS Direct shows both.",
      },
    ],
    keywords: [
      "federal medical supply contracts",
      "government healthcare bids",
      "NAICS 423450 contracts",
      "VA medical supply contract",
      "SAM.gov medical supplies",
    ],
  },
}
