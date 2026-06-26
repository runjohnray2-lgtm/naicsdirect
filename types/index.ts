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
  isActive: boolean
}

export interface BidApiResponse {
  bids: Bid[]
  total: number
  page: number
  error?: string
}
