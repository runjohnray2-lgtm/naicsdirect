/**
 * Detects whether a SAM.gov opportunity is a DLA DIBBS posting.
 *
 * DIBBS (DLA Internet Bid Board System) postings are published through the
 * same SAM.gov Opportunities feed as regular RFQs, but require their own
 * separate portal registration/PIN at dibbs.bsm.dla.mil to actually submit a
 * quote - a real extra hurdle regular SAM.gov email-submission RFQs don't have.
 *
 * Heuristic: agency is Defense Logistics Agency AND title follows DIBBS' FSC
 * (Federal Supply Class) prefix convention, e.g. "62--WINDOW,LIGHTING FIXTUR"
 * or "47--HOSE,NONMETALLIC".
 */
export function isDibbsPosting(agency: string | null | undefined, title: string | null | undefined): boolean {
  if (!agency || !title) return false
  const isDla = agency.toUpperCase().includes("DEFENSE LOGISTICS AGENCY")
  const hasFscPrefix = /^\d{2}--/.test(title.trim())
  return isDla && hasFscPrefix
}
