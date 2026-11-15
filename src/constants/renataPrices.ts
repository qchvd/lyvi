// Renata França care prices: single source for the "Lymphatic drainage" page cards and the gift vouchers page.
// Change a price here and both pages follow.

export type RenataCare = "drainage" | "remodelage" | "miracleFace"
export const SESSION_COUNTS = [1, 5, 8] as const
export type SessionCount = (typeof SESSION_COUNTS)[number]

// Price PER SESSION, for 1, 5 and 8 sessions packages ("cures")
export const RENATA_PRICES: Record<RenataCare, Record<SessionCount, number>> = {
    drainage: { 1: 130, 5: 120, 8: 110 },
    remodelage: { 1: 130, 5: 120, 8: 110 },
    miracleFace: { 1: 60, 5: 55, 8: 50 },
}

// Total price of a package ("cure"): e.g. drainage, 5 sessions → 5 × 120 = 600 €
export const totalPrice = (care: RenataCare, sessions: SessionCount) => RENATA_PRICES[care][sessions] * sessions

// Savings compared with the same number of single sessions: e.g. drainage, 5 sessions → 650 − 600 = 50 €
export const savings = (care: RenataCare, sessions: SessionCount) => RENATA_PRICES[care][1] * sessions - totalPrice(care, sessions)

