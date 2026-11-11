import { useState, type MouseEvent, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Check, Info, Plus } from "lucide-react"
import { Header } from "../header/Header"
import { Footer } from "../footer/Footer"
import { CTA } from "../header/CTA"
import { CareBadge } from "../CareBadge"
import { useSidebar } from "../../contexts/SidebarContext"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { trackEvent } from "../../utils/analytics"

// Placeholder for prices not set yet: kept visible and highlighted until replaced in the texts
const PRICE_PLACEHOLDER = "TARIF_A_COMPLETER"
const FORMULAS_ANCHOR = "formules"
// Pregnancy and new mothers box of the "Drainage lymphatique" page
const DRAINAGE_PREGNANCY_ANCHOR = "grossesse"
const HERO_IMAGE = "/images/optimized/post-partum/hero-movement"

type KeyFact = { label: string; value: string; detail: string }
type TitledText = { title: string; text: string }
type Formula = { title: string; intro: string; points: string[]; price: string[]; featured?: boolean }
type FaqItem = { question: string; answer: string }

// Sections alternate between white and the warm background
const whiteSection = "bg-white"
const warmSection = "bg-[var(--color-warm-bg)]"
const sectionTitle = "text-[1.7rem] text-center uppercase lg:text-4xl"
const smallLabel = "text-xs font-bold uppercase tracking-wider text-[var(--color-terracotta)]"
const secondaryText = "text-[var(--color-warm-text-secondary)]"
const card = "rounded-lg bg-white border border-[var(--color-warm-border)]"

// Renders "**bold**" parts of a text in bold
function renderBold(text: string) {
    return text.split("**").map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part))
}

// Keeps hyphenated words (e.g. "post-partum") whole instead of wrapping at the hyphen
function renderWithoutHyphenBreaks(text: string) {
    return text.split(" ").map((word, index) => (
        <span key={index}>
            {index > 0 && " "}
            {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
        </span>
    ))
}

// Turns the part of a text written between [brackets] into a terracotta link
function renderLink(text: string, to: string) {
    return text.split(/\[(.+?)\]/).map((part, index) => (index % 2 === 1
        ? <Link key={index} to={to} className="underline font-semibold text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)]">{part}</Link>
        : part))
}

// Removes the [brackets] marking a link, for plain-text uses (schema.org)
function stripLinkMarks(text: string) {
    return text.replace(/\[(.+?)\]/g, "$1")
}

// Highlights the price placeholder in yellow wherever it appears in a text
function withPricePlaceholder(text: string) {
    return text.split(PRICE_PLACEHOLDER).map((part, index) => (
        <span key={index}>
            {index > 0 && <mark className="bg-yellow-200 text-[var(--color-brand-dark-green)] px-1 rounded">{PRICE_PLACEHOLDER}</mark>}
            {part}
        </span>
    ))
}

// Scrolls to the formulas section, below the fixed header
function scrollToFormulas(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const target = document.getElementById(FORMULAS_ANCHOR)
    if (!target) return
    // The target is a whole section: it starts right below the fixed header (no strip of the previous section visible)
    const headerHeight = document.querySelector("header")?.offsetHeight ?? 72
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight
    if (window.lenis) {
        window.lenis.scrollTo(top)
    } else {
        window.scrollTo({ top, behavior: "smooth" })
    }
    trackEvent("CTA", "Click", "Formulas - Post-partum - Hero")
}

function Section({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
    return (
        <section id={id} className={`px-8 lg:px-10 py-14 md:py-20 scroll-mt-18 ${className}`}>
            <div className="mx-auto max-w-6xl">{children}</div>
        </section>
    )
}

// FAQ accordion: answers stay in the HTML when collapsed (search engines), one answer open at a time
function FaqAccordion({ items, linkTo }: { items: FaqItem[]; linkTo: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="mx-auto max-w-3xl mt-10 border-t border-[var(--color-warm-border)]">
            {items.map((item, index) => {
                const isOpen = openIndex === index
                return (
                    <div key={index} className="border-b border-[var(--color-warm-border)]">
                        <h3>
                            <button
                                type="button"
                                id={`postpartum-faq-question-${index}`}
                                aria-expanded={isOpen}
                                aria-controls={`postpartum-faq-answer-${index}`}
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between gap-6 py-5 text-left text-lg font-semibold cursor-pointer"
                            >
                                {item.question}
                                <Plus
                                    className={`w-6 h-6 shrink-0 text-[var(--color-terracotta)] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </button>
                        </h3>
                        <div
                            id={`postpartum-faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`postpartum-faq-question-${index}`}
                            aria-hidden={!isOpen}
                            className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                        >
                            <div className="overflow-hidden">
                                <p className={`pb-5 leading-relaxed ${secondaryText}`}>{renderLink(item.answer, linkTo)}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/*
 * Post-partum & diastasis page: scannable sections (tiles, cards, timeline, FAQ accordion)
 * with the terracotta accent of the post-partum universe
 */
export function PostPartum() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation(["postPartum", "routes"])
    const lang = i18n.language

    const keyFacts = t("keyFacts.items", { returnObjects: true }) as KeyFact[]
    const forWhom = t("forWhom.items", { returnObjects: true }) as TitledText[]
    const trainings = t("approach.trainings", { returnObjects: true }) as string[]
    const steps = t("steps.items", { returnObjects: true }) as TitledText[]
    const formulas = t("formulas.items", { returnObjects: true }) as Formula[]
    const faqItems = t("faq.items", { returnObjects: true }) as FaqItem[]
    const drainagePregnancyPath = `/${lang}${t("routes:treatments")}#${DRAINAGE_PREGNANCY_ANCHOR}`

    // schema.org FAQ markup for search engines
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: stripLinkMarks(item.answer) },
        })),
    }

    return (
        <>
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>
            {/* White page background so the footer wave joins the last (white) section */}
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main id="main-content" inert={isSidebarOpen ? true : undefined} className="pt-18 flex-1 text-[var(--color-brand-green)]">
                    {/* ===== 1. PAGE HEADER ===== */}
                    <Section className={whiteSection}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <div>
                                <CareBadge type="medical" />
                                <h1 className="text-[1.7rem] lg:text-4xl font-bold leading-snug text-[var(--color-brand-dark-green)] mt-5">
                                    {renderWithoutHyphenBreaks(t("hero.title"))}
                                </h1>
                                <p className="md:text-lg leading-relaxed mt-6">{renderBold(t("hero.text"))}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-8">
                                    <CTA variant="terracotta" source="Post-partum - Hero" />
                                    <a href={`#${FORMULAS_ANCHOR}`} className="btn-terracotta-outline block" onClick={scrollToFormulas}>
                                        {t("hero.formulasButton")}
                                    </a>
                                </div>
                            </div>
                            {/* Hero photo, shown whole: the frame follows the picture's own shape, capped in height */}
                            <img
                                src={`${HERO_IMAGE}-800w.webp`}
                                srcSet={`${HERO_IMAGE}-400w.webp 400w, ${HERO_IMAGE}-800w.webp 800w, ${HERO_IMAGE}-1200w.webp 1200w`}
                                sizes="(max-width: 767px) 100vw, 50vw"
                                alt={t("hero.imageAlt")}
                                width={1333}
                                height={2000}
                                className="block mx-auto w-auto h-auto max-w-full max-h-[560px] rounded-lg bg-[var(--color-terracotta-light)]"
                            />
                        </div>
                    </Section>

                    {/* ===== 2. KEY FACTS ===== */}
                    <Section className={warmSection}>
                        <h2 className={sectionTitle}>{t("keyFacts.title")}</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                            {keyFacts.map((fact, index) => (
                                <li key={index} className={`${card} p-6`}>
                                    <p className={smallLabel}>{fact.label}</p>
                                    <p className="text-xl font-bold leading-snug text-[var(--color-brand-dark-green)] mt-2">{fact.value}</p>
                                    <p className={`text-sm leading-relaxed mt-2 ${secondaryText}`}>{fact.detail}</p>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    {/* ===== 3. FOR WHOM + 4. PERINEUM BOX ===== */}
                    <Section className={whiteSection}>
                        <h2 className={sectionTitle}>{t("forWhom.title")}</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
                            {forWhom.map((item, index) => (
                                <li key={index} className={`${card} p-6`}>
                                    <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)]">{item.title}</h3>
                                    <p className={`leading-relaxed mt-2 ${secondaryText}`}>{item.text}</p>
                                </li>
                            ))}
                        </ul>
                        {/* Link to the Renata França drainage for pregnant women and new mothers */}
                        <p className="rounded-lg bg-[var(--color-terracotta-light)] px-6 py-5 mt-6 leading-relaxed md:text-center md:text-balance">
                            <CareBadge type="wellness" className="bg-white! mr-3 align-middle" />
                            {renderLink(t("drainageNote"), drainagePregnancyPath)}
                        </p>
                        <aside className="flex flex-col sm:flex-row gap-5 rounded-lg bg-[var(--color-terracotta-light)] p-6 lg:p-8 mt-12">
                            <span className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-[var(--color-terracotta)] text-white">
                                <Info className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--color-brand-dark-green)]">{t("perineum.title")}</h2>
                                <p className="leading-relaxed mt-2">{renderBold(t("perineum.text"))}</p>
                            </div>
                        </aside>
                    </Section>

                    {/* ===== 5. DIASTASIS ===== */}
                    <Section className={warmSection}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <div className="flex flex-col gap-4 leading-relaxed md:text-lg">
                                <h2 className="text-[1.7rem] lg:text-4xl uppercase">{t("diastasis.title")}</h2>
                                <p>{renderBold(t("diastasis.p1"))}</p>
                                <p>{t("diastasis.p2")}</p>
                                <p>
                                    {t("diastasis.p3")}
                                    <Link
                                        to={`/${lang}${t("routes:postOp")}`}
                                        className="underline font-semibold text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)]"
                                    >
                                        {t("diastasis.p3Link")}
                                    </Link>
                                    {t("diastasis.p3End")}
                                </p>
                            </div>
                            <figure className="rounded-lg border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] overflow-hidden px-4 py-6">
                                {/* Diastasis diagram, inline so its colours follow the terracotta variables and its labels the site font */}
                                <svg width="100%" viewBox="20 0 290 280" className="block mx-auto max-w-[400px] [font-family:inherit]" role="img" aria-label={t("diastasis.imageAlt")}>
                                    <path d="M107 28 C89 28 75 30 69 34 L93 228 C97 232 103 232 107 232 Z" fill="#E7C3B3" stroke="var(--color-terracotta)" strokeWidth="1.6" />
                                    <path d="M113 28 C131 28 145 30 151 34 L127 228 C123 232 117 232 113 232 Z" fill="#E7C3B3" stroke="var(--color-terracotta)" strokeWidth="1.6" />
                                    <path d="M74 60 L105 60 M79 100 L105 100 M84 140 L105 140 M115 60 L146 60 M115 100 L141 100 M115 140 L136 140" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                                    <line x1="110" y1="28" x2="110" y2="232" stroke="var(--color-warm-text-secondary)" strokeWidth="1.4" />
                                    <circle cx="110" cy="140" r="3.5" fill="var(--color-warm-bg)" stroke="var(--color-warm-text-secondary)" strokeWidth="1.4" />
                                    <path d="M246 28 C228 28 214 30 208 34 L232 228 C236 232 242 232 246 232 L246 200 C246 176 231 164 231 140 C231 116 246 104 246 80 Z" fill="#E7C3B3" stroke="var(--color-terracotta)" strokeWidth="1.6" />
                                    <path d="M254 28 C272 28 286 30 292 34 L268 228 C264 232 258 232 254 232 L254 200 C254 176 269 164 269 140 C269 116 254 104 254 80 Z" fill="#E7C3B3" stroke="var(--color-terracotta)" strokeWidth="1.6" />
                                    <path d="M246 80 C246 104 231 116 231 140 C231 164 246 176 246 200 L254 200 C254 176 269 164 269 140 C269 116 254 104 254 80 Z" fill="#FFFFFF" />
                                    <path d="M213 60 L243 60 M218 100 L239 100 M223 140 L229 140 M257 60 L287 60 M261 100 L282 100 M271 140 L277 140" stroke="var(--color-terracotta)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                                    <line x1="250" y1="28" x2="250" y2="80" stroke="var(--color-warm-text-secondary)" strokeWidth="1.4" />
                                    <line x1="250" y1="80" x2="250" y2="200" stroke="var(--color-warm-text-secondary)" strokeWidth="1.4" strokeDasharray="3 4" />
                                    <line x1="250" y1="200" x2="250" y2="232" stroke="var(--color-warm-text-secondary)" strokeWidth="1.4" />
                                    <circle cx="250" cy="140" r="3.5" fill="var(--color-warm-bg)" stroke="var(--color-warm-text-secondary)" strokeWidth="1.4" />
                                    <text x="62" y="38" textAnchor="end" fontSize="11" fill="var(--color-warm-text-secondary)">{t("diastasis.labelRibs")}</text>
                                    <text x="76" y="144" textAnchor="end" fontSize="11" fill="var(--color-warm-text-secondary)">{t("diastasis.labelNavel")}</text>
                                    <text x="86" y="234" textAnchor="end" fontSize="11" fill="var(--color-warm-text-secondary)">{t("diastasis.labelPubis")}</text>
                                    <text x="110" y="264" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E2F35">{t("diastasis.captionWithout")}</text>
                                    <text x="250" y="264" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-terracotta)">{t("diastasis.captionWith")}</text>
                                </svg>
                                <figcaption className={`text-center text-sm mt-4 ${secondaryText}`}>{t("diastasis.caption")}</figcaption>
                            </figure>
                        </div>
                    </Section>

                    {/* ===== 6. MY APPROACH ===== */}
                    <Section className={whiteSection}>
                        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">
                            <div className="flex flex-col gap-4 leading-relaxed md:text-lg">
                                <h2 className="text-[1.7rem] lg:text-4xl uppercase">{t("approach.title")}</h2>
                                <p>{renderBold(t("approach.p1"))}</p>
                                <p>{t("approach.p2")}</p>
                            </div>
                            <div className="md:pt-2">
                                <p className={smallLabel}>{t("approach.trainingLabel")}</p>
                                <ul className="flex flex-wrap gap-2 mt-4">
                                    {trainings.map((training, index) => (
                                        <li key={index} className="px-4 py-1.5 rounded-full bg-white border border-[var(--color-warm-border)] text-sm">
                                            {training}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* ===== 7. STEPS (timeline) ===== */}
                    <Section className={warmSection}>
                        <h2 className={sectionTitle}>{t("steps.title")}</h2>
                        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                            {steps.map((step, index) => (
                                <li key={index} className={`${card} overflow-hidden`}>
                                    <div
                                        className={`h-1.5 ${index % 2 === 0 ? "bg-[var(--color-terracotta)]" : "bg-[var(--color-terracotta-mid)]"}`}
                                        aria-hidden="true"
                                    />
                                    <div className="p-6">
                                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-terracotta)] text-white font-bold">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)] mt-4">{step.title}</h3>
                                        <p className={`leading-relaxed mt-2 ${secondaryText}`}>{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </Section>

                    {/* ===== 8. FORMULAS ===== */}
                    <Section id={FORMULAS_ANCHOR} className={whiteSection}>
                        <h2 className={sectionTitle}>{t("formulas.title")}</h2>
                        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 mt-12 mx-auto max-w-xl lg:max-w-4xl">
                            {formulas.map((formula, index) => (
                                <li
                                    key={index}
                                    className={`relative flex flex-col rounded-lg bg-white p-6 lg:p-8 ${formula.featured
                                        ? "border-2 border-[var(--color-terracotta)]"
                                        : "border border-[var(--color-warm-border)]"
                                        }`}
                                >
                                    {formula.featured && (
                                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold">
                                            {t("formulas.featuredBadge")}
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-[var(--color-brand-dark-green)]">{formula.title}</h3>
                                    <p className={`leading-relaxed mt-2 ${secondaryText}`}>{formula.intro}</p>
                                    <ul className="flex flex-col gap-3 mt-5">
                                        {formula.points.map((point, pointIndex) => (
                                            <li key={pointIndex} className="flex gap-3 leading-relaxed">
                                                <Check className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-terracotta)]" strokeWidth={2} aria-hidden="true" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto pt-5">
                                        <div className="flex flex-col gap-2 border-t border-[var(--color-warm-border)] pt-4 font-semibold">
                                            {formula.price.map((line, lineIndex) => (
                                                <p key={lineIndex}>{withPricePlaceholder(line)}</p>
                                            ))}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className={`text-center leading-relaxed mt-10 max-w-3xl mx-auto ${secondaryText}`}>{t("formulas.footnote")}</p>
                    </Section>

                    {/* ===== 9. FAQ ===== */}
                    <Section className={warmSection}>
                        <h2 className={sectionTitle}>{t("faq.title")}</h2>
                        <FaqAccordion items={faqItems} linkTo={drainagePregnancyPath} />
                    </Section>

                    {/* ===== 10. READY TO START ===== */}
                    <section className="px-8 lg:px-10 py-14 md:py-16 bg-white">
                        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
                            <div className="flex flex-col gap-3 leading-relaxed">
                                <h2 className="text-[1.7rem] lg:text-4xl uppercase">{t("ready.title")}</h2>
                                <p className="md:text-lg">{t("ready.text")}</p>
                            </div>
                            <CTA variant="terracotta" source="Post-partum - Ready to start §" />
                        </div>
                    </section>
                </main>
                <Footer />
                {/* Room for the fixed mobile button, so it never hides the end of the page */}
                <div className="h-20 bg-[var(--color-brand-dark-green)] md:hidden" aria-hidden="true" />
            </div>

            {/* Fixed "book an appointment" button, small screens only */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-center py-3 bg-white border-t border-[var(--color-warm-border)]">
                <CTA variant="terracotta" source="Post-partum - Sticky mobile" />
            </div>
        </>
    )
}
