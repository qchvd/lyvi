import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { ArrowRight, Gift } from "lucide-react"
import { trackEvent } from "../../utils/analytics"

// Shows the gift vouchers banner above the menu on every page (e.g. for Christmas).
// Set to false to remove it: the page spacing follows automatically (see "--header-h" in index.css).
export const SHOW_GIFT_BANNER = true

/**
 * Thin banner at the top of the fixed header, linking to the gift vouchers page.
 * Hidden on the gift vouchers page itself.
 */
export function GiftBanner() {
    const { i18n, t } = useTranslation(["header", "routes"])
    const { pathname } = useLocation()
    const giftVouchersPath = `/${i18n.language}${t("routes:giftVouchers")}`

    if (!SHOW_GIFT_BANNER || pathname === giftVouchersPath) return null

    return (
        // "gift-banner" class: makes the header taller in index.css
        <Link
            to={giftVouchersPath}
            className="gift-banner group flex items-center justify-center gap-2 h-9 px-4 bg-[var(--color-brand-cream)] hover:bg-[var(--color-sand-light)] text-[var(--color-brand-dark-green)] text-xs sm:text-sm font-medium transition-colors"
            onClick={() => trackEvent("Gift banner", "Click", "Gift vouchers page")}
        >
            <Gift className="gift-wiggle w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="truncate">{t("giftBanner")}</span>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
        </Link>
    )
}

