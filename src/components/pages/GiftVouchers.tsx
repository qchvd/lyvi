import { useEffect, useId, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Check, ChevronDown, Download, Gift, Lock } from "lucide-react"
import { Header } from "../header/Header"
import { Footer } from "../footer/Footer"
import { CareBadge } from "../CareBadge"
import { useSidebar } from "../../contexts/SidebarContext"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { trackEvent } from "../../utils/analytics"
import { GIFT_VOUCHERS, GIFT_VOUCHER_GROUPS, GIFT_VOUCHER_LINKS, type GiftVoucher } from "../../constants/giftVouchers"

type TitledText = { title: string; text: string }
// Thank-you message after paying: "pending" while the webhook creates the voucher, "late" if it takes too long
type OrderStatus = "checking" | "pending" | "ready" | "late"

// Netlify Function giving the voucher of a paid order (netlify/functions/gift-voucher.mjs)
const VOUCHER_API = "/.netlify/functions/gift-voucher"
const POLL_DELAY = 2000
const POLL_ATTEMPTS = 15

const sectionTitle = "text-[1.7rem] text-center uppercase lg:text-4xl"

function Section({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
    return (
        <section id={id} className={`px-8 lg:px-10 py-14 md:py-20 scroll-mt-[var(--header-h)] ${className}`}>
            <div className="mx-auto max-w-6xl">{children}</div>
        </section>
    )
}

/**
 * "Gift vouchers" page: Renata França care to offer, paid through Stripe Payment Links
 * (prices: src/constants/renataPrices.ts, links: src/constants/giftVouchers.ts)
 */
export function GiftVouchers() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation("giftVouchers")
    const [selectedId, setSelectedId] = useState("")
    const selectId = useId()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    // Back from Stripe: /fr/bons-cadeaux?session_id=cs_… (see netlify/functions/gift-voucher-return.mjs)
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get("session_id") || ""
    const [orderStatus, setOrderStatus] = useState<OrderStatus>("checking")
    const [orderEmail, setOrderEmail] = useState("")

    // Asks the server for the voucher until the webhook has created it; unknown/unpaid order: plain page
    useEffect(() => {
        if (!sessionId) return
        let cancelled = false
        let timer: ReturnType<typeof setTimeout>
        const check = async (attempt: number) => {
            try {
                const response = await fetch(`${VOUCHER_API}?session_id=${encodeURIComponent(sessionId)}`)
                const data = await response.json()
                if (cancelled) return
                if (data.status === "unknown") {
                    navigate(pathname, { replace: true })
                    return
                }
                if (data.status === "ready") {
                    setOrderEmail(data.email)
                    setOrderStatus("ready")
                    return
                }
                setOrderStatus("pending")
            } catch {
                // Network error: try again
            }
            if (cancelled) return
            if (attempt >= POLL_ATTEMPTS) setOrderStatus("late")
            else timer = setTimeout(() => check(attempt + 1), POLL_DELAY)
        }
        check(1)
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [sessionId, navigate, pathname])

    // Stripe payment page in the visitor's language; the language also sets the voucher and email language
    const paymentUrl = (link: string) => {
        const url = new URL(link)
        url.searchParams.set("client_reference_id", i18n.language)
        url.searchParams.set("locale", i18n.language)
        return url.toString()
    }

    const careName = (voucher: GiftVoucher) => t(`card.cares.${voucher.care}`)
    const sessionsLabel = (voucher: GiftVoucher) => t("card.sessions", { count: voucher.sessions })
    const price = (amount: number) => t("card.price", { price: amount })
    const vouchersOf = (group: GiftVoucher["group"]) => GIFT_VOUCHERS.filter((voucher) => voucher.group === group)

    const selectedVoucher = GIFT_VOUCHERS.find((voucher) => voucher.id === selectedId)
    const selectedLink = selectedId ? GIFT_VOUCHER_LINKS[selectedId] : ""
    const steps = t("steps.items", { returnObjects: true }) as TitledText[]
    const conditions = t("conditions.items", { returnObjects: true }) as string[]

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-sand-bg)]">
            <Header />
            <main id="main-content" inert={isSidebarOpen ? true : undefined} className="pt-[var(--header-h)] flex-1 text-[var(--color-brand-green)]">
                {sessionId && (
                    <>
                        {/* Order page: not for search engines */}
                        <Helmet>
                            <meta name="robots" content="noindex" />
                        </Helmet>
                        {/* ===== THANK-YOU MESSAGE (back from Stripe) ===== */}
                        <Section className="bg-[var(--color-sand-bg)]">
                            <div className="flex flex-col items-center text-center rounded-lg bg-white border border-[var(--color-sand-border)] p-6 lg:p-10 mx-auto max-w-xl" aria-live="polite">
                                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-sand-light)] text-[var(--color-sand)]">
                                    <Gift className="gift-wiggle w-7 h-7" strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <h1 className="text-[1.7rem] lg:text-3xl font-bold leading-snug text-[var(--color-brand-dark-green)] mt-5">{t("thanks.title")}</h1>
                                {orderStatus === "ready" && (
                                    <>
                                        <p className="leading-relaxed mt-4 text-[var(--color-sand-text-secondary)]">{t("thanks.text", { email: orderEmail })}</p>
                                        <a href={`${VOUCHER_API}?session_id=${encodeURIComponent(sessionId)}&download=1`} className="btn-sand inline-flex items-center gap-2 mt-6">
                                            <Download className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                                            {t("thanks.download")}
                                        </a>
                                        <p className="text-sm mt-5 text-[var(--color-sand-text-secondary)]">{t("thanks.spam")}</p>
                                    </>
                                )}
                                {(orderStatus === "checking" || orderStatus === "pending") && (
                                    <p className="leading-relaxed mt-4 text-[var(--color-sand-text-secondary)]">{t("thanks.pending")}</p>
                                )}
                                {orderStatus === "late" && (
                                    <p className="leading-relaxed mt-4 text-[var(--color-sand-text-secondary)]">{t("thanks.late")}</p>
                                )}
                                <a
                                    href={pathname}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        navigate(pathname, { replace: true })
                                    }}
                                    className="font-semibold underline mt-6 text-[var(--color-sand-text)] hover:text-[var(--color-sand-dark)]"
                                >
                                    {t("thanks.back")}
                                </a>
                            </div>
                        </Section>
                    </>
                )}

                {!sessionId && <Section className="bg-[var(--color-sand-bg)]">
                    {/* ===== 1. INTRODUCTION ===== */}
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                        <CareBadge type="wellness" className="bg-white!" />
                        <h1 className="text-[1.7rem] lg:text-4xl font-bold leading-snug text-[var(--color-brand-dark-green)] mt-4">{t("hero.title")}</h1>
                        <p className="md:text-lg leading-relaxed mt-4 text-[var(--color-sand-text-secondary)]">{t("hero.text")}</p>
                    </div>

                    {/* ===== 2. PRICES, CHOICE AND PAYMENT ===== */}
                    <div className="rounded-lg bg-white border border-[var(--color-sand-border)] p-6 lg:p-8 mt-10 mx-auto max-w-xl">
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark-green)]">
                            <Gift className="w-6 h-6 text-[var(--color-sand)]" strokeWidth={1.5} aria-hidden="true" />
                            {t("card.title")}
                        </h2>

                        {/* Price list: same layout as the price lists of the drainage page (name on the left, price on the right) */}
                        {GIFT_VOUCHER_GROUPS.map((group) => (
                            <div key={group} className="mt-6">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-sand-text)]">{t(`card.groups.${group}`)}</h3>
                                <dl className="mt-1">
                                    {vouchersOf(group).map((voucher) => (
                                        <div key={voucher.id} className="flex items-baseline justify-between gap-4 py-2.5 border-b border-[var(--color-sand-border)] last:border-b-0">
                                            <dt className="text-[var(--color-sand-text-secondary)]">{careName(voucher)}</dt>
                                            <dd className="font-bold text-[var(--color-brand-dark-green)] text-right whitespace-nowrap">{price(voucher.price)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ))}

                        {/* Choice of the voucher */}
                        <div className="rounded-lg bg-[var(--color-sand-bg)] p-4 mt-8">
                            <label htmlFor={selectId} className="block text-sm font-semibold text-[var(--color-sand-text)]">{t("card.selectLabel")}</label>
                            <div className="relative mt-2">
                                <select
                                    id={selectId}
                                    value={selectedId}
                                    onChange={(event) => setSelectedId(event.target.value)}
                                    className="w-full appearance-none rounded-lg border border-[var(--color-sand-border-strong)] bg-white py-3 pl-4 pr-10 text-[var(--color-brand-dark-green)] cursor-pointer focus:outline-2 focus:outline-[var(--color-sand)]"
                                >
                                    <option value="" disabled>{t("card.selectPlaceholder")}</option>
                                    {GIFT_VOUCHER_GROUPS.map((group) => (
                                        <optgroup key={group} label={t(`card.groups.${group}`)}>
                                            {vouchersOf(group).map((voucher) => (
                                                <option key={voucher.id} value={voucher.id}>
                                                    {`${careName(voucher)} (${sessionsLabel(voucher)}) – ${price(voucher.price)}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-sand-text)]" strokeWidth={1.5} aria-hidden="true" />
                            </div>

                            {/* Full recap of the choice: the closed list cuts long names on phones */}
                            {selectedVoucher && (
                                <p className="text-center mt-4 leading-relaxed text-[var(--color-sand-text-secondary)]" aria-live="polite">
                                    {t(`card.groups.${selectedVoucher.group}`)}
                                    <br />
                                    <strong className="text-[var(--color-brand-dark-green)]">{careName(selectedVoucher)} – {price(selectedVoucher.price)}</strong>
                                </p>
                            )}

                            {/* Payment button: disabled until a voucher is chosen and its Stripe link exists */}
                            <div className="flex flex-col items-center mt-5">
                                {selectedLink ? (
                                    <a
                                        href={paymentUrl(selectedLink)}
                                        className="btn-sand"
                                        onClick={() => trackEvent("Gift vouchers", "Click", `Offer - ${selectedId}`)}
                                    >
                                        {t("card.button")}
                                    </a>
                                ) : (
                                    <button type="button" disabled className="btn-sand opacity-50 cursor-not-allowed!">
                                        {t("card.button")}
                                    </button>
                                )}
                                {selectedId && !selectedLink && (
                                    <p className="text-sm text-center mt-3 text-[var(--color-sand-text-secondary)]" role="status">{t("card.comingSoon")}</p>
                                )}
                                <p className="flex items-center gap-1.5 text-xs mt-3 text-[var(--color-sand-text-secondary)]">
                                    <Lock className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                                    {t("card.secure")}
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>}

                {/* ===== 3. HOW IT WORKS ===== */}
                <Section className="bg-white">
                    <h2 className={sectionTitle}>{t("steps.title")}</h2>
                    <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
                        {steps.map((step, index) => (
                            <li key={index} className="flex flex-col rounded-lg bg-[var(--color-sand-bg)] p-6">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-sand)] text-white font-bold" aria-hidden="true">{index + 1}</span>
                                <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)] mt-4">{step.title}</h3>
                                <p className="leading-relaxed mt-2 text-[var(--color-sand-text-secondary)]">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </Section>

                {/* ===== 4. CONDITIONS ===== */}
                <Section className="bg-[var(--color-sand-bg)]">
                    <div className="rounded-lg bg-white border border-[var(--color-sand-border)] p-6 lg:p-8 mx-auto max-w-3xl">
                        <h2 className="text-2xl font-bold text-[var(--color-brand-dark-green)]">{t("conditions.title")}</h2>
                        <ul className="mt-4">
                            {conditions.map((condition, index) => (
                                <li key={index} className="flex gap-3 py-2 leading-relaxed text-[var(--color-sand-text-secondary)]">
                                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-sand)]" strokeWidth={2} aria-hidden="true" />
                                    {condition}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>
            </main>
            <Footer />
        </div>
    )
}
