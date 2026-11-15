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
        "drainage-1": "https://buy.stripe.com/test_cNi7sL80O5Rd2ANcto00000",
        "remodelage-1": "https://buy.stripe.com/test_4gM00j3Ky5Rdejv0KG00001",
        "miracleFace-1": "https://buy.stripe.com/test_7sYaEX94ScfBcbn3WS00002",
        "drainage-5": "https://buy.stripe.com/test_8x23cv0ym5Rd0sF9hc00003",
        "remodelage-5": "https://buy.stripe.com/test_dRmdR93Ky7Zl0sF2SO00004",
        "miracleFace-5": "https://buy.stripe.com/test_6oU3cv80OenJfnz50W00005",
        "drainage-8": "https://buy.stripe.com/test_14AcN53KygvRb7jbpk00006",
        "remodelage-8": "https://buy.stripe.com/test_4gM4gza8WfrNdfr3WS00007",
        "miracleFace-8": "https://buy.stripe.com/test_fZu14nch4djFgrDbpk00008",
    },
    en: {
        "drainage-1": "https://buy.stripe.com/test_8x28wP94SdjF8Zbbpk00009",
        "remodelage-1": "https://buy.stripe.com/test_cNidR9epcfrNejv9hc0000a",
        "miracleFace-1": "https://buy.stripe.com/test_aFabJ16WK7Zlejv1OK0000b",
        "drainage-5": "https://buy.stripe.com/test_00w7sLdl8enJ8Zbalg0000c",
        "remodelage-5": "https://buy.stripe.com/test_9B63cvepc6VhgrDcto0000d",
        "miracleFace-5": "https://buy.stripe.com/test_7sYeVd80OcfBdfr3WS0000e",
        "drainage-8": "https://buy.stripe.com/test_cNi6oHch44N96R30KG0000f",
        "remodelage-8": "https://buy.stripe.com/test_eVqeVd1CqfrNa3fdxs0000g",
        "miracleFace-8": "https://buy.stripe.com/test_cNi8wP6WKcfBdfr3WS0000h",
    },
    de: {
        "drainage-1": "https://buy.stripe.com/test_dRm5kD80O6Vhb7j50W0000i",
        "remodelage-1": "https://buy.stripe.com/test_bJedR9bd03J5a3fcto0000j",
        "miracleFace-1": "https://buy.stripe.com/test_eVqaEX6WKcfBb7j0KG0000k",
        "drainage-5": "https://buy.stripe.com/test_8x2fZhch44N9ejv1OK0000l",
        "remodelage-5": "https://buy.stripe.com/test_9B64gzbd05Rdfnz6500000m",
        "miracleFace-5": "https://buy.stripe.com/test_28EaEXftgcfB2ANgJE0000n",
        "drainage-8": "https://buy.stripe.com/test_14A14ndl86Vh7V73WS0000o",
        "remodelage-8": "https://buy.stripe.com/test_9B6cN580O93p5MZeBw0000p",
        "miracleFace-8": "https://buy.stripe.com/test_dRm9ATch4frNgrD0KG0000q",
    },
}
