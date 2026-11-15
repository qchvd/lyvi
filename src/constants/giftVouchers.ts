import { SESSION_COUNTS, totalPrice, type RenataCare, type SessionCount } from "./renataPrices"

// Gift vouchers sold on the "Gift vouchers" page: each Renata França care, for 1, 5 or 8 sessions.
// Each one opens its own Stripe Payment Link.

export type GiftVoucher = {
    id: string
    // "single" = 1 session, "cure5" / "cure8" = packages
    group: "single" | "cure5" | "cure8"
    care: RenataCare
    sessions: SessionCount
    price: number
}

const CARES: RenataCare[] = ["drainage", "remodelage", "miracleFace"]
const GROUP_BY_SESSIONS: Record<SessionCount, GiftVoucher["group"]> = { 1: "single", 5: "cure5", 8: "cure8" }

export const GIFT_VOUCHER_GROUPS: GiftVoucher["group"][] = ["single", "cure5", "cure8"]

export const GIFT_VOUCHERS: GiftVoucher[] = SESSION_COUNTS.flatMap((sessions) => CARES.map((care) => ({
    id: `${care}-${sessions}`,
    group: GROUP_BY_SESSIONS[sessions],
    care,
    sessions,
    price: totalPrice(care, sessions),
})))

// Stripe Payment Links, one per voucher and per language (product name and beneficiary field translated).
// WRITTEN BY scripts/stripe-gift-vouchers.mjs (test or live links, depending on the Stripe key used):
// after a price change, run the script again rather than editing by hand.
// Missing link = not created yet: the "Offer this care" button stays disabled.
export const GIFT_VOUCHER_LINKS: Record<string, Record<string, string>> = {
    fr: {
        "drainage-1": "https://buy.stripe.com/cNi6oIbVVexVbyB8Am1Nu00",
        "remodelage-1": "https://buy.stripe.com/bJeeVe4ttblJgSV17U1Nu01",
        "miracleFace-1": "https://buy.stripe.com/3cI6oIe4389x3254k61Nu02",
        "drainage-5": "https://buy.stripe.com/4gM8wQgcbcpN6ehaIu1Nu03",
        "remodelage-5": "https://buy.stripe.com/28E28s6BBdtR5ad5oa1Nu04",
        "miracleFace-5": "https://buy.stripe.com/8x2fZie43cpN1Y19Eq1Nu05",
        "drainage-8": "https://buy.stripe.com/6oUdRa5xx2PddGJ5oa1Nu06",
        "remodelage-8": "https://buy.stripe.com/7sYcN6e43exVauxg2O1Nu07",
        "miracleFace-8": "https://buy.stripe.com/fZu28s2llblJ46917U1Nu08",
    },
    en: {
        "drainage-1": "https://buy.stripe.com/dRm00k9NN1L99qt17U1Nu09",
        "remodelage-1": "https://buy.stripe.com/28E5kE8JJdtRcCF3g21Nu0a",
        "miracleFace-1": "https://buy.stripe.com/fZu6oIaRRdtR7il4k61Nu0b",
        "drainage-5": "https://buy.stripe.com/9B69AUe433ThbyB3g21Nu0c",
        "remodelage-5": "https://buy.stripe.com/6oUbJ2cZZ0H59qtg2O1Nu0d",
        "miracleFace-5": "https://buy.stripe.com/fZueVe7FF61peKN03Q1Nu0e",
        "drainage-8": "https://buy.stripe.com/3cIbJ26BBfBZ32503Q1Nu0f",
        "remodelage-8": "https://buy.stripe.com/fZucN6bVVblJbyB4k61Nu0g",
        "miracleFace-8": "https://buy.stripe.com/fZu5kE6BB61p7il8Am1Nu0h",
    },
    de: {
        "drainage-1": "https://buy.stripe.com/3cI6oIe43exV5ad3g21Nu0i",
        "remodelage-1": "https://buy.stripe.com/5kQ14o5xx1L98mpaIu1Nu0j",
        "miracleFace-1": "https://buy.stripe.com/7sY5kE8JJgG3dGJ03Q1Nu0k",
        "drainage-5": "https://buy.stripe.com/28E00kf8789x8mp8Am1Nu0l",
        "remodelage-5": "https://buy.stripe.com/dRmdRae433ThcCF7wi1Nu0m",
        "miracleFace-5": "https://buy.stripe.com/28E7sM3pp9dB8mp2bY1Nu0n",
        "drainage-8": "https://buy.stripe.com/eVqdRaaRRfBZ6eh03Q1Nu0o",
        "remodelage-8": "https://buy.stripe.com/00wcN6cZZ75tbyBaIu1Nu0p",
        "miracleFace-8": "https://buy.stripe.com/eVq3cw6BBahF9qt7wi1Nu0q",
    },
}
