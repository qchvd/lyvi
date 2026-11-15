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

// Stripe Payment Links, one per voucher. WRITTEN BY scripts/stripe-gift-vouchers.mjs (test or live links,
// depending on the Stripe key used): after a price change, run the script again rather than editing by hand.
// Empty = not created yet: the "Offer this care" button stays disabled.
export const GIFT_VOUCHER_LINKS: Record<string, string> = {
    "drainage-1": "https://buy.stripe.com/test_cNi7sL80O5Rd2ANcto00000",
    "remodelage-1": "https://buy.stripe.com/test_4gM00j3Ky5Rdejv0KG00001",
    "miracleFace-1": "https://buy.stripe.com/test_7sYaEX94ScfBcbn3WS00002",
    "drainage-5": "https://buy.stripe.com/test_8x23cv0ym5Rd0sF9hc00003",
    "remodelage-5": "https://buy.stripe.com/test_dRmdR93Ky7Zl0sF2SO00004",
    "miracleFace-5": "https://buy.stripe.com/test_6oU3cv80OenJfnz50W00005",
    "drainage-8": "https://buy.stripe.com/test_14AcN53KygvRb7jbpk00006",
    "remodelage-8": "https://buy.stripe.com/test_4gM4gza8WfrNdfr3WS00007",
    "miracleFace-8": "https://buy.stripe.com/test_fZu14nch4djFgrDbpk00008",
}
