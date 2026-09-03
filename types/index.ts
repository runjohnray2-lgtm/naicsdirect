export interface Bid {
  id: string
  title: string
  solicitationNumber: string
  responseDate: string
  type: string
  typeCode: string
  agency: string
  subAgency: string
  publishDate: string
  setAside?: string
  uiLink?: string
  naicsCode?: string
  placeStreet?: string
  placeCity?: string
  placeState?: string
  placeZip?: string
  placeCountry?: string
  isActive: boolean
  isDibbs: boolean
}

export interface BidApiResponse {
  bids: Bid[]
  total: number
  page: number
  preview?: boolean
  previewLimit?: number | null
  error?: string
}
