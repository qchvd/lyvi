import { useEffect, useRef, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Info, Plus } from "lucide-react"
import { Header } from "../header/Header"
import { Footer } from "../footer/Footer"
import { useSidebar } from "../../contexts/SidebarContext"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { CTA } from "../header/CTA"
import { CareBadge } from "../CareBadge"
import { RenataCard } from "../treatments/RenataCard"
import { trackEvent } from "../../utils/analytics"
import facialMassageImage from "../../assets/images/facialMassage.webp"
import legMassageImage from "../../assets/images/legMassagePhoto.webp"
import remodelingMassageImage from "../../assets/images/remodelingMassagePhoto.webp"

// Anchors linked from the home page cards and within this page
const LIPEDEMA_ANCHOR = "lipoedeme"
const RENATA_ANCHOR = "renata"
const THERAPEUTIC_ANCHOR = "therapeutique"
const REIMBURSEMENT_ANCHOR = "remboursement"
const PREGNANCY_ANCHOR = "grossesse"
// Background photo of the page header, in landscape (desktop) and portrait (phone) versions
const HERO_BG = "/images/optimized/lymphatic-drainage/hero-bg"

type ComparisonRow = { label: string; therapeutic: string; renata: string }
type RenataCardTexts = { title: string; text: string; duration: string; benefits: string[] }
type TherapeuticCard = { title: string; paragraphs: string[]; link?: string; linkIntro?: string }
type TitledText = { title: string; text: string }
type PriceLine = { label: string; price: string }
type PregnancyTexts = {
    title: string
    // "formulas" (list of prices) replaces "formula" + "price" in the languages that have it (French for now)
    pregnant: { title: string; text: string; formula?: string; price?: string; formulasIntro?: string; formulas?: PriceLine[] }
    newMother: { title: string; text: string; linkIntro: string; link: string; linkEnd: string }
}
// "link" names where the [bracketed] part of the answer leads (see faqLinks)
type FaqItem = { question: string; answer: string; link?: string }

const sectionTitle = "text-[1.7rem] text-center uppercase lg:text-4xl"
// 6 cards: 3 per row on large screens
const sixCardsGrid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
// 5 cards: 3 on the first row and 2 on the second on large screens
const fiveCardsGrid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5"
const fiveCardsSpan = (index: number) => (index < 3 ? "lg:col-span-2" : "lg:col-span-3")

// Renders "**bold**" parts of a text in bold
function renderBold(text: string) {
    return text.split("**").map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part))
}

// Turns the part of a text written between [brackets] into a link
function renderLink(text: string, to: string) {
    return text.split(/\[(.+?)\]/).map((part, index) => (index % 2 === 1
        ? <Link key={index} to={to} replace={to.includes("#")} className="underline font-semibold text-[var(--color-brand-dark-green)] hover:text-[var(--color-brand-green)]">{part}</Link>
        : part))
}

// Plain text of an answer, without the [brackets] marking a link (schema.org)
function stripFaqMarks(text: string) {
    return text.replace(/\[(.+?)\]/g, "$1")
}

// FAQ accordion (same as the post-op and post-partum pages): answers stay in the HTML when collapsed (search engines), one answer open at a time
function FaqAccordion({ items, links }: { items: FaqItem[]; links: Record<string, string> }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="mx-auto max-w-3xl mt-10 border-t border-[var(--color-brand-green)]/25">
            {items.map((item, index) => {
                const isOpen = openIndex === index
                return (
                    <div key={index} className="border-b border-[var(--color-brand-green)]/25">
                        <h3>
                            <button
                                type="button"
                                id={`drainage-faq-question-${index}`}
                                aria-expanded={isOpen}
                                aria-controls={`drainage-faq-answer-${index}`}
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between gap-6 py-5 text-left text-lg font-semibold cursor-pointer"
                            >
                                {item.question}
                                <Plus
                                    className={`w-6 h-6 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </button>
                        </h3>
                        <div
                            id={`drainage-faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`drainage-faq-question-${index}`}
                            aria-hidden={!isOpen}
                            className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                        >
                            <div className="overflow-hidden">
                                <p className="pb-5 leading-relaxed">{item.link ? renderLink(item.answer, links[item.link]) : item.answer}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function Section({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
    return (
        <section id={id} className={`px-8 lg:px-10 py-14 md:py-20 scroll-mt-18 ${className}`}>
            <div className="mx-auto max-w-6xl">{children}</div>
        </section>
    )
}

// "Discover …" / "Learn more" line at the bottom of a clickable card
function CardLinkLabel({ label, className }: { label: string; className: string }) {
    return (
        <span className={`inline-flex items-center gap-2 font-semibold mt-auto pt-4 ${className}`}>
            {label}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
        </span>
    )
}

// Therapeutic vs Renata França comparison; scrolls horizontally inside its own frame on small screens
function ComparisonTable({ therapeuticTitle, renataTitle, rows, reimbursementPath }: { therapeuticTitle: string; renataTitle: string; rows: ComparisonRow[]; reimbursementPath: string }) {
    return (
        <div className="rounded-lg border border-[var(--color-sand-border)] bg-white overflow-hidden mt-10">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse leading-relaxed text-left">
                    <thead>
                        <tr>
                            <td className="p-4 w-1/5"></td>
                            <th scope="col" className="p-4 font-bold text-[var(--color-brand-dark-green)] bg-[var(--color-medical-tint)]">{therapeuticTitle}</th>
                            <th scope="col" className="p-4 font-bold text-[var(--color-sand-text)] bg-[var(--color-sand-light)]">{renataTitle}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label} className="border-t border-[var(--color-sand-border)]">
                                <th scope="row" className="p-4 font-bold align-top">{row.label}</th>
                                <td className="p-4 align-top">{renderLink(row.therapeutic, reimbursementPath)}</td>
                                <td className="p-4 align-top">{row.renata}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

/**
 * "Lymphatic drainage" page (replaces the former "Treatments" page)
 * Renata França well-being care (sand colours) vs therapeutic drainage (medical, green)
 */
export function LymphaticDrainage() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation(["lymphaticDrainage", "treatments", "routes", "ariaLabels"])
    const { pathname, search, hash } = useLocation()
    const navigate = useNavigate()
    const isFirstHashScroll = useRef(true)

    // Scroll to the anchor (#renata, #grossesse, #therapeutique, #lipoedeme, #remboursement) when present in the URL
    // On arrival, wait for the page to render so the target position is final
    useEffect(() => {
        if (!hash) return
        const delay = isFirstHashScroll.current ? 700 : 0
        isFirstHashScroll.current = false

        const timer = setTimeout(() => {
            const target = document.getElementById(hash.slice(1))
            if (!target) return
            // Offset so the target isn't hidden under the fixed header:
            // a whole section starts right below the header (no strip of the previous section visible),
            // a box inside a section (#lipoedeme, #grossesse, #remboursement) keeps 24px of breathing room
            const headerHeight = document.querySelector("header")?.offsetHeight ?? 72
            const offset = target.tagName === "SECTION" ? headerHeight : headerHeight + 24
            const top = target.getBoundingClientRect().top + window.scrollY - offset
            if (window.lenis) {
                window.lenis.scrollTo(top)
            } else {
                window.scrollTo({ top })
            }
            // Remove the anchor from the URL once scrolled (cleaner address bar);
            // replace: no extra history entry, and clicking the same link again still scrolls
            navigate({ pathname, search }, { replace: true })
        }, delay)

        return () => clearTimeout(timer)
    }, [hash, pathname, search, navigate])

    const postOpPath = `/${i18n.language}${t("routes:postOp")}`
    const postPartumPath = `/${i18n.language}${t("routes:postPartum")}`
    const anchorPath = (anchor: string) => `${pathname}#${anchor}`
    const comparisonRows = t("comparison.rows", { returnObjects: true }) as ComparisonRow[]
    const therapeuticCards = t("therapeutic.cards", { returnObjects: true }) as Record<string, TherapeuticCard>
    const reimbursementCases = t("therapeutic.reimbursement.cases", { returnObjects: true }) as string[]
    const therapeuticPrices = t("therapeutic.prices.lines", { returnObjects: true }) as PriceLine[]
    const hesitateItems = t("hesitate.items", { returnObjects: true }) as TitledText[]
    // Same order as hesitate.items: 4 therapeutic cards first, then 2 well-being (Renata França) cards
    const hesitateLinks = [postOpPath, postOpPath, anchorPath(LIPEDEMA_ANCHOR), anchorPath(THERAPEUTIC_ANCHOR), anchorPath(RENATA_ANCHOR), anchorPath(PREGNANCY_ANCHOR)]
    const WELLNESS_HESITATE_START = 4
    const renataCard = (key: string) => t(`renata.cards.${key}`, { returnObjects: true }) as RenataCardTexts
    const pregnancy = t("renata.pregnancy", { returnObjects: true }) as PregnancyTexts
    // FAQ: only shown in the languages whose texts contain it (French for now)
    const faqTexts = t("faq.items", { returnObjects: true })
    const faqItems = Array.isArray(faqTexts) ? (faqTexts as FaqItem[]) : []
    const faqLinks = { pregnancy: anchorPath(PREGNANCY_ANCHOR), postPartum: postPartumPath }
    // schema.org FAQ markup for search engines
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: stripFaqMarks(item.answer) },
        })),
    }

    // Prices of the Renata França cards (1, 5 and 8 sessions packages)
    const priceMapDrainage: Record<number, number> = { 1: 130, 5: 120, 8: 110 }
    const priceMapRemodelage: Record<number, number> = { 1: 130, 5: 120, 8: 110 }
    const priceMapMiracleFace: Record<number, number> = { 1: 60, 5: 55, 8: 50 }
    // Savings in euros (formatted per language with the "renata.price" text)
    const savingsDrainage: Record<number, number> = { 1: 0, 5: 50, 8: 160 }
    const savingsRemodelage: Record<number, number> = { 1: 0, 5: 50, 8: 160 }
    const savingsMiracleFace: Record<number, number> = { 1: 0, 5: 25, 8: 80 }

    const renataCards = [
        { key: "drainage", image: legMassageImage, alt: t("treatments:altDrainagePicture"), priceMap: priceMapDrainage, savingsMap: savingsDrainage, featured: true },
        { key: "remodelage", image: remodelingMassageImage, alt: t("treatments:altRemodelagePicture"), priceMap: priceMapRemodelage, savingsMap: savingsRemodelage },
        { key: "miracleFace", image: facialMassageImage, alt: t("treatments:altMiracleFacePicture"), priceMap: priceMapMiracleFace, savingsMap: savingsMiracleFace },
    ]

    return (
        <>
            {faqItems.length > 0 && (
                <Helmet>
                    <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
                </Helmet>
            )}
            {/* Cream page background so the footer wave joins the last (cream) section */}
            <div className="min-h-screen flex flex-col bg-[var(--color-brand-cream)]">
                <Header />
                <main id="main-content" inert={isSidebarOpen ? true : undefined} className="pt-18 flex-1 text-[var(--color-brand-green)]">
                    {/* ===== 1. PAGE HEADER: two doors ===== */}
                    <Section className="relative overflow-hidden bg-[var(--color-brand-cream)]">
                        {/* Decorative background photo: upright on phones, turned to landscape from tablets up */}
                        <picture aria-hidden="true">
                            <source
                                media="(min-width: 768px)"
                                srcSet={`${HERO_BG}-landscape-800w.webp 800w, ${HERO_BG}-landscape-1200w.webp 1200w, ${HERO_BG}-landscape-1600w.webp 1600w`}
                                sizes="100vw"
                            />
                            <img
                                src={`${HERO_BG}-portrait-800w.webp`}
                                srcSet={`${HERO_BG}-portrait-400w.webp 400w, ${HERO_BG}-portrait-800w.webp 800w`}
                                sizes="100vw"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover object-center"
                            />
                        </picture>
                        {/* Cream veil so the photo is only suggested: strength set by --drainage-hero-veil-opacity in index.css */}
                        <div className="absolute inset-0 bg-[var(--color-brand-cream)] opacity-[var(--drainage-hero-veil-opacity)]" aria-hidden="true" />
                        <div className="relative">
                            <div className="text-center max-w-3xl mx-auto">
                                <h1 className="text-[1.7rem] lg:text-4xl font-bold leading-snug text-[var(--color-brand-dark-green)]">{t("hero.title")}</h1>
                                <p className="md:text-lg leading-relaxed mt-4 text-[var(--color-brand-dark-green)]">{t("hero.text")}</p>
                            </div>
                            {/* Same order as the home page: therapeutic (medical) care first, then well-being */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                                <Link
                                    to={anchorPath(THERAPEUTIC_ANCHOR)}
                                    replace
                                    className="group flex flex-col rounded-lg bg-[var(--color-medical-tint)] p-6 lg:p-8 transition-shadow duration-300 hover:shadow-lg"
                                    onClick={() => trackEvent('Drainage page', 'Click', 'Door - Therapeutic')}
                                >
                                    <CareBadge type="medical" />
                                    <h2 className="text-xl lg:text-2xl font-bold text-[var(--color-brand-dark-green)] mt-4">{t("hero.medical.title")}</h2>
                                    <p className="leading-relaxed mt-2">{t("hero.medical.text")}</p>
                                    <CardLinkLabel label={t("hero.medical.link")} className="text-[var(--color-brand-dark-green)]" />
                                </Link>
                                <Link
                                    to={anchorPath(RENATA_ANCHOR)}
                                    replace
                                    className="group flex flex-col rounded-lg bg-[var(--color-sand-light)] p-6 lg:p-8 transition-shadow duration-300 hover:shadow-lg"
                                    onClick={() => trackEvent('Drainage page', 'Click', 'Door - Renata')}
                                >
                                    <CareBadge type="wellness" className="bg-white!" />
                                    <h2 className="text-xl lg:text-2xl font-bold text-[var(--color-brand-dark-green)] mt-4">{t("hero.wellness.title")}</h2>
                                    <p className="leading-relaxed mt-2 text-[var(--color-sand-text-secondary)]">{t("hero.wellness.text")}</p>
                                    <CardLinkLabel label={t("hero.wellness.link")} className="text-[var(--color-sand-text)]" />
                                </Link>
                            </div>
                        </div>
                    </Section>

                    {/* ===== 2. THERAPEUTIC DRAINAGE (same order as the home page: medical care first) ===== */}
                    <Section id={THERAPEUTIC_ANCHOR} className="bg-white">
                        <div className="flex flex-col items-center text-center">
                            <CareBadge type="medical" />
                            <h2 className={`${sectionTitle} mt-4`}>{t("therapeutic.title")}</h2>
                        </div>
                        <ul className={`${fiveCardsGrid} mt-10`}>
                            {Object.entries(therapeuticCards).map(([key, card], index) => (
                                <li
                                    key={key}
                                    id={key === "lipedema" ? LIPEDEMA_ANCHOR : undefined}
                                    className={`flex flex-col rounded-lg bg-[var(--color-medical-tint)] p-6 scroll-mt-24 ${fiveCardsSpan(index)}`}
                                >
                                    <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)]">{card.title}</h3>
                                    {card.paragraphs.map((paragraph, paragraphIndex) => (
                                        <p key={paragraphIndex} className="leading-relaxed mt-2">{paragraph}</p>
                                    ))}
                                    {key === "surgery" && card.link && (
                                        <Link
                                            to={postOpPath}
                                            className="group mt-auto"
                                            onClick={() => trackEvent('Drainage page', 'Click', 'Post-op page')}
                                        >
                                            <CardLinkLabel label={card.link} className="text-[var(--color-brand-dark-green)] underline" />
                                        </Link>
                                    )}
                                    {key === "heavyLegs" && card.link && (
                                        <p className="leading-relaxed mt-2">
                                            {card.linkIntro}
                                            <Link to={anchorPath(RENATA_ANCHOR)} replace className="underline font-semibold text-[var(--color-sand-text)] hover:text-[var(--color-sand-dark)]">
                                                {card.link}
                                            </Link>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Reimbursement box */}
                        <aside id={REIMBURSEMENT_ANCHOR} className="flex flex-col sm:flex-row gap-5 rounded-lg bg-[var(--color-medical-tint)] p-6 lg:p-8 mt-12">
                            <span className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-[var(--color-brand-green)] text-white">
                                <Info className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                            </span>
                            <div className="leading-relaxed">
                                <h3 className="text-xl font-bold text-[var(--color-brand-dark-green)]">{t("therapeutic.reimbursement.title")}</h3>
                                <p className="mt-2">{renderBold(t("therapeutic.reimbursement.p1"))}</p>
                                <ul className="flex flex-wrap gap-2 mt-4">
                                    {reimbursementCases.map((item, index) => (
                                        <li key={index} className="px-4 py-1.5 rounded-full bg-white text-sm font-semibold">{item}</li>
                                    ))}
                                </ul>
                                <p className="mt-4">{t("therapeutic.reimbursement.p2")}</p>
                            </div>
                        </aside>

                        {/* Therapeutic prices */}
                        <div className="rounded-lg bg-white border border-[var(--color-sand-border)] p-6 lg:p-8 mt-8 mx-auto max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--color-brand-dark-green)]">{t("therapeutic.prices.title")}</h3>
                            <dl className="mt-4">
                                {therapeuticPrices.map((line, index) => (
                                    <div key={index} className="flex items-baseline justify-between gap-4 py-3 border-b border-[var(--color-sand-border)] last:border-b-0">
                                        <dt>{line.label}</dt>
                                        <dd className="font-bold">{line.price}</dd>
                                    </div>
                                ))}
                            </dl>
                            <p className="text-sm mt-4">{t("therapeutic.prices.payment")}</p>
                        </div>
                    </Section>

                    {/* ===== 3. COMPARISON TABLE ===== */}
                    <Section className="bg-[var(--color-brand-cream)]">
                        <h2 className={sectionTitle}>{t("comparison.title")}</h2>
                        <p className="text-center md:text-lg leading-relaxed mt-4 max-w-3xl mx-auto">{renderBold(t("comparison.text"))}</p>
                        <ComparisonTable
                            therapeuticTitle={t("comparison.therapeutic")}
                            renataTitle={t("comparison.renata")}
                            rows={comparisonRows}
                            reimbursementPath={anchorPath(REIMBURSEMENT_ANCHOR)}
                        />
                    </Section>

                    {/* ===== 4. RENATA FRANÇA CARE ===== */}
                    <Section id={RENATA_ANCHOR} className="bg-[var(--color-sand-bg)]">
                        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                            <CareBadge type="wellness" />
                            <h2 className={`${sectionTitle} mt-4`}>{t("renata.title")}</h2>
                            <p className="md:text-lg leading-relaxed mt-4 text-[var(--color-sand-text-secondary)]">{t("renata.text")}</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 mt-10 mx-auto max-w-md lg:max-w-none">
                            {renataCards.map((card) => {
                                const texts = renataCard(card.key)
                                return (
                                    <RenataCard
                                        key={card.key}
                                        treatmentKey={card.key}
                                        imageSrc={card.image}
                                        imageAlt={card.alt}
                                        title={texts.title}
                                        text={texts.text}
                                        duration={texts.duration}
                                        benefits={texts.benefits}
                                        priceMap={card.priceMap}
                                        savingsMap={card.savingsMap}
                                        featured={card.featured}
                                    />
                                )
                            })}
                        </div>

                        {/* Pregnancy and new mothers box */}
                        <aside id={PREGNANCY_ANCHOR} className="rounded-lg bg-white border border-[var(--color-sand-border)] p-6 lg:p-8 mt-10 scroll-mt-24">
                            <h3 className="text-2xl font-bold text-[var(--color-brand-dark-green)]">{pregnancy.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                <div className="flex flex-col">
                                    <h4 className="text-lg font-bold text-[var(--color-sand-text)]">{pregnancy.pregnant.title}</h4>
                                    <p className="leading-relaxed mt-2 text-[var(--color-sand-text-secondary)]">{pregnancy.pregnant.text}</p>
                                    <div className="rounded-lg bg-[var(--color-sand-bg)] p-4 mt-4">
                                        {pregnancy.pregnant.formulas ? (
                                            <>
                                                <p className="text-sm text-[var(--color-sand-text-secondary)]">{pregnancy.pregnant.formulasIntro}</p>
                                                {/* Same layout as the price lists: name on the left, duration and price on the right */}
                                                <dl className="mt-1">
                                                    {pregnancy.pregnant.formulas.map((line, index) => (
                                                        <div key={index} className="flex items-baseline justify-between gap-4 py-2 border-b border-[var(--color-sand-border)] last:border-b-0">
                                                            <dt className="text-[var(--color-sand-text-secondary)]">{line.label}</dt>
                                                            <dd className="font-bold text-[var(--color-brand-dark-green)] text-right whitespace-nowrap">{line.price}</dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-[var(--color-sand-text-secondary)]">{pregnancy.pregnant.formula}</p>
                                                <p className="font-bold text-[var(--color-brand-dark-green)] mt-1">{pregnancy.pregnant.price}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-auto pt-6 flex justify-center">
                                        <CTA variant="sand" source="Drainage - Pregnancy" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-lg font-bold text-[var(--color-sand-text)]">{pregnancy.newMother.title}</h4>
                                    <p className="leading-relaxed mt-2 text-[var(--color-sand-text-secondary)]">{pregnancy.newMother.text}</p>
                                    <p className="leading-relaxed mt-4 text-[var(--color-sand-text-secondary)]">
                                        {pregnancy.newMother.linkIntro}
                                        <Link
                                            to={postPartumPath}
                                            className="underline font-semibold text-[var(--color-sand-text)] hover:text-[var(--color-sand-dark)]"
                                            onClick={() => trackEvent('Drainage page', 'Click', 'Post-partum page')}
                                        >
                                            {pregnancy.newMother.link}
                                        </Link>
                                        {pregnancy.newMother.linkEnd}
                                    </p>
                                    <div className="mt-auto pt-6 flex justify-center">
                                        <CTA variant="sand" source="Drainage - New mother" />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <p className="text-center leading-relaxed mt-10 max-w-3xl mx-auto text-[var(--color-sand-text-secondary)]">{t("renata.note")}</p>
                    </Section>

                    {/* ===== 5. FAQ (only in the languages whose texts contain it) ===== */}
                    {faqItems.length > 0 && (
                        <Section className="bg-white">
                            <h2 className={sectionTitle}>{t("faq.title")}</h2>
                            <FaqAccordion items={faqItems} links={faqLinks} />
                        </Section>
                    )}

                    {/* ===== 6. STILL HESITATING? ===== */}
                    <Section className="bg-[var(--color-brand-cream)]">
                        <h2 className={sectionTitle}>{t("hesitate.title")}</h2>
                        <ul className={`${sixCardsGrid} mt-10`}>
                            {hesitateItems.map((item, index) => {
                                // The last two cards lead to Renata França care (sand colours)
                                const isWellness = index >= WELLNESS_HESITATE_START
                                return (
                                    <li key={index}>
                                        <Link
                                            to={hesitateLinks[index]}
                                            replace={hesitateLinks[index].startsWith(`${pathname}#`)}
                                            className={`group flex flex-col h-full rounded-lg p-6 transition-shadow duration-300 hover:shadow-lg ${isWellness ? "bg-[var(--color-sand-light)]" : "bg-[var(--color-medical-tint)]"}`}
                                            onClick={() => trackEvent('Drainage page', 'Click', `Hesitate - ${item.title}`)}
                                        >
                                            <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)]">{item.title}</h3>
                                            <p className={`leading-relaxed mt-2 ${isWellness ? "text-[var(--color-sand-text-secondary)]" : ""}`}>{item.text}</p>
                                            <CardLinkLabel
                                                label={t("hesitate.learnMore")}
                                                className={isWellness ? "text-[var(--color-sand-text)]" : "text-[var(--color-brand-dark-green)]"}
                                            />
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                        <div className="flex flex-col items-center text-center mt-10">
                            <p className="md:text-lg leading-relaxed">{t("hesitate.p1")}</p>
                            <CTA className="mt-6" source="Drainage - Hesitate §" />
                        </div>
                    </Section>
                </main>
                <Footer />
                {/* Room for the fixed mobile button, so it never hides the end of the page */}
                <div className="h-20 bg-[var(--color-brand-dark-green)] md:hidden" aria-hidden="true" />
            </div>

            {/* Fixed "book an appointment" button, small screens only (same as the post-op page) */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-center py-3 bg-[var(--color-brand-dark-green)]/95 border-t border-[var(--color-brand-cream)]/20">
                <CTA source="Drainage - Sticky mobile" />
            </div>
        </>
    )
}
