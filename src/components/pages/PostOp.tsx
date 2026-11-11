import { useState, type MouseEvent, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { CalendarDays, Euro, FileText, ListChecks, Plus, ShieldCheck } from "lucide-react"
import { Header } from "../header/Header"
import { Footer } from "../footer/Footer"
import { CTA } from "../header/CTA"
import { CareBadge } from "../CareBadge"
import { useSidebar } from "../../contexts/SidebarContext"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { trackEvent } from "../../utils/analytics"
import postOpHeroPicture400 from "../../assets/images/optimized/postOpHeroPicture-400w.webp"
import postOpHeroPicture800 from "../../assets/images/optimized/postOpHeroPicture-800w.webp"

const PRICES_ANCHOR = "tarifs"

type KeyFact = { label: string; value: string; detail: string }
type JourneyStep = { when: string; title: string; text: string }
type ProtocolItem = { title: string; text: string; soon?: boolean }
type Intervention = { name: string; sessions: string; details?: string[] }
type PriceLine = { label: string; price: string }
type FaqItem = { question: string; answer: string }

const keyFactIcons = [FileText, CalendarDays, ListChecks, Euro]

// Section backgrounds alternate between cream and a very light sage tint
const creamSection = "bg-[var(--color-brand-cream)] text-[var(--color-brand-green)]"
const tintSection = "bg-[var(--color-brand-sage-tint)] text-[var(--color-brand-green)]"
const sectionTitle = "text-[1.7rem] text-center uppercase lg:text-4xl"

// Renders "**bold**" parts of a text in bold
function renderBold(text: string) {
    return text.split("**").map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part))
}

// Keeps hyphenated words (e.g. "post-opératoire") whole instead of wrapping at the hyphen
function renderWithoutHyphenBreaks(text: string) {
    return text.split(" ").map((word, index) => (
        <span key={index}>
            {index > 0 && " "}
            {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
        </span>
    ))
}

// Scrolls to the prices section, below the fixed header
function scrollToPrices(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const target = document.getElementById(PRICES_ANCHOR)
    if (!target) return
    // The target is a whole section: it starts right below the fixed header (no strip of the previous section visible)
    const headerHeight = document.querySelector("header")?.offsetHeight ?? 72
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight
    if (window.lenis) {
        window.lenis.scrollTo(top)
    } else {
        window.scrollTo({ top, behavior: "smooth" })
    }
    trackEvent("CTA", "Click", "Prices - Post-op - Hero")
}

function Section({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
    return (
        <section id={id} className={`px-8 lg:px-10 py-14 md:py-20 scroll-mt-18 ${className}`}>
            <div className="mx-auto max-w-6xl">{children}</div>
        </section>
    )
}

// FAQ accordion: answers stay in the HTML when collapsed (search engines), one answer open at a time
function FaqAccordion({ items }: { items: FaqItem[] }) {
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
                                id={`postop-faq-question-${index}`}
                                aria-expanded={isOpen}
                                aria-controls={`postop-faq-answer-${index}`}
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
                            id={`postop-faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`postop-faq-question-${index}`}
                            aria-hidden={!isOpen}
                            className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                        >
                            <div className="overflow-hidden">
                                <p className="pb-5 leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function PriceCard({ title, subtitle, lines, note }: { title: string; subtitle: string; lines: PriceLine[]; note?: string }) {
    return (
        <div className="rounded-lg bg-[var(--color-brand-sage-tint)] p-6 lg:p-8">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm mt-1">{subtitle}</p>
            <dl className="mt-5">
                {lines.map((line, index) => (
                    <div key={index} className="flex items-baseline justify-between gap-4 py-3 border-b border-[var(--color-brand-green)]/20 last:border-b-0">
                        <dt>{line.label}</dt>
                        <dd className="font-bold text-right">{line.price}</dd>
                    </div>
                ))}
            </dl>
            {note && <p className="text-sm leading-relaxed mt-4">{note}</p>}
        </div>
    )
}

/*
 * Post-op page: short, scannable sections (tiles, timeline, cards, FAQ accordion)
 * instead of long paragraphs. English and German keep the original page.
 */
export function PostOp() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation(["postOp", "routes"])
    const lang = i18n.language

    const keyFacts = t("keyFacts.items", { returnObjects: true }) as KeyFact[]
    const steps = t("journey.steps", { returnObjects: true }) as JourneyStep[]
    const protocol = t("protocol.items", { returnObjects: true }) as ProtocolItem[]
    const interventions = t("interventions.items", { returnObjects: true }) as Intervention[]
    const faqItems = t("faq.items", { returnObjects: true }) as FaqItem[]

    // schema.org FAQ markup for search engines
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    }

    return (
        <>
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main id="main-content" inert={isSidebarOpen ? true : undefined} className="pt-18 flex-1">
                    {/* ===== 1. PAGE HEADER ===== */}
                    <section className="px-8 lg:px-10 py-12 md:py-16">
                        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <div>
                                <CareBadge type="medical" />
                                <h1 className="text-[1.7rem] lg:text-4xl font-bold leading-snug mt-5">{renderWithoutHyphenBreaks(t("hero.title"))}</h1>
                                <p className="md:text-lg leading-relaxed mt-6">{renderBold(t("hero.text"))}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-8">
                                    <CTA source="Post-op - Hero" />
                                    <a href={`#${PRICES_ANCHOR}`} className="btn-golden-outline block" onClick={scrollToPrices}>
                                        {t("hero.pricesButton")}
                                    </a>
                                </div>
                            </div>
                            {/* Hero photo (wider crop than the home care card, as it is shown larger), shown whole and capped in height */}
                            <img
                                src={postOpHeroPicture800}
                                srcSet={`${postOpHeroPicture400} 400w, ${postOpHeroPicture800} 800w`}
                                sizes="(max-width: 767px) 100vw, 50vw"
                                alt={t("hero.imageAlt")}
                                width={800}
                                height={1200}
                                className="block mx-auto w-auto h-auto max-w-full max-h-[560px] rounded-lg bg-[var(--color-brand-cream)]/15"
                            />
                        </div>
                    </section>

                    {/* ===== 2. KEY FACTS ===== */}
                    <Section className={creamSection}>
                        <h2 className={sectionTitle}>{t("keyFacts.title")}</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                            {keyFacts.map((fact, index) => {
                                const Icon = keyFactIcons[index]
                                return (
                                    <li key={index} className="rounded-lg bg-[var(--color-brand-sage-tint)] p-6">
                                        <Icon className="w-7 h-7" strokeWidth={1.5} aria-hidden="true" />
                                        <p className="text-xs font-bold uppercase tracking-wider mt-4">{fact.label}</p>
                                        <p className="text-2xl font-bold leading-tight text-[var(--color-brand-dark-green)] mt-2">{fact.value}</p>
                                        <p className="text-sm leading-relaxed mt-2">{fact.detail}</p>
                                    </li>
                                )
                            })}
                        </ul>
                    </Section>

                    {/* ===== 3. JOURNEY (timeline: horizontal on desktop, vertical on mobile) ===== */}
                    <Section className={tintSection}>
                        <h2 className={sectionTitle}>{t("journey.title")}</h2>
                        <div className="relative mt-12">
                        <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-[var(--color-brand-green)]/40" aria-hidden="true" />
                        <ol className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
                            {steps.map((step, index) => (
                                <li key={index} className="relative flex md:flex-col md:items-center md:text-center gap-5 md:gap-4">
                                    {index < steps.length - 1 && (
                                        <div className="md:hidden absolute left-6 top-12 -bottom-10 w-px bg-[var(--color-brand-green)]/40" aria-hidden="true" />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-[var(--color-brand-dark-green)] text-[var(--color-brand-cream)] text-lg font-bold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wider text-[#6B5428]">{step.when}</p>
                                        <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)] mt-1">{step.title}</h3>
                                        <p className="leading-relaxed mt-2">{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        </div>
                    </Section>

                    {/* ===== 4. PROTOCOL ===== */}
                    <Section className={creamSection}>
                        <h2 className={sectionTitle}>{t("protocol.title")}</h2>
                        <p className="text-center md:text-lg mt-4">{t("protocol.subtitle")}</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                            {protocol.map((item, index) => (
                                <li key={index} className="rounded-lg bg-[var(--color-brand-sage-tint)] p-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-[var(--color-brand-dark-green)]">{item.title}</h3>
                                        {item.soon && (
                                            <span className="w-fit px-2.5 py-0.5 text-xs font-bold rounded-full border border-[var(--color-brand-green)]">
                                                {t("protocol.soon")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="leading-relaxed mt-2">{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    {/* ===== 5. INTERVENTIONS ===== */}
                    <Section className={tintSection}>
                        <h2 className={sectionTitle}>{t("interventions.title")}</h2>
                        <p className="text-center md:text-lg mt-4">{t("interventions.subtitle")}</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                            {interventions.map((item, index) => (
                                <li key={index} className="rounded-lg bg-[var(--color-brand-cream)] p-5">
                                    <p className="font-bold text-[var(--color-brand-dark-green)]">{item.name}</p>
                                    <p className="mt-1">{item.sessions}</p>
                                    {item.details?.map((detail, detailIndex) => (
                                        <p key={detailIndex} className="text-sm leading-snug mt-1">{detail}</p>
                                    ))}
                                </li>
                            ))}
                        </ul>
                        <p className="text-center md:text-lg mt-10">{t("interventions.rhythmNote")}</p>
                        <p className="text-center md:text-lg mt-4">
                            {t("interventions.lipedemaText")}
                            <Link to={`/${lang}${t("routes:treatments")}#lipoedeme`} className="underline font-semibold">
                                {t("interventions.lipedemaLink")}
                            </Link>
                        </p>
                    </Section>

                    {/* ===== 6. SAFETY BANNER ===== */}
                    <section className="px-8 lg:px-10 py-14 md:py-16 bg-[var(--color-brand-green)] text-[var(--color-brand-cream)]">
                        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="w-10 h-10 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                                <h2 className="text-[1.7rem] lg:text-4xl leading-tight uppercase">{t("safety.title")}</h2>
                            </div>
                            <p className="md:text-lg leading-relaxed">{t("safety.text")}</p>
                        </div>
                    </section>

                    {/* ===== 7. PRICES ===== */}
                    <Section id={PRICES_ANCHOR} className={creamSection}>
                        <h2 className={sectionTitle}>{t("prices.title")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-10 mx-auto max-w-4xl">
                            <PriceCard
                                title={t("prices.aesthetic.title")}
                                subtitle={t("prices.aesthetic.subtitle")}
                                lines={t("prices.aesthetic.lines", { returnObjects: true }) as PriceLine[]}
                            />
                            <PriceCard
                                title={t("prices.reconstructive.title")}
                                subtitle={t("prices.reconstructive.subtitle")}
                                lines={t("prices.reconstructive.lines", { returnObjects: true }) as PriceLine[]}
                                note={t("prices.reconstructive.note")}
                            />
                        </div>
                        <p className="text-center mt-8">{t("prices.payment")}</p>
                    </Section>

                    {/* ===== 8. FAQ ===== */}
                    <Section className={tintSection}>
                        <h2 className={sectionTitle}>{t("faq.title")}</h2>
                        <FaqAccordion items={faqItems} />
                    </Section>

                    {/* ===== 9. READY TO START ===== */}
                    <section className="px-8 lg:px-10 py-14 md:py-16">
                        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
                            <div className="flex flex-col gap-3 leading-relaxed">
                                <h2 className="text-[1.7rem] lg:text-4xl uppercase">{t("ready.title")}</h2>
                                <p className="md:text-lg">
                                    {t("ready.training")}
                                    <Link to={`/${lang}${t("routes:about")}`} className="underline font-semibold">
                                        {t("ready.aboutLink")}
                                    </Link>
                                </p>
                                <p>{t("ready.addresses")}</p>
                            </div>
                            <CTA source="Post-op - Ready to start §" />
                        </div>
                    </section>
                </main>
                <Footer />
                {/* Room for the fixed mobile button, so it never hides the end of the page */}
                <div className="h-20 bg-[var(--color-brand-dark-green)] md:hidden" aria-hidden="true" />
            </div>

            {/* Fixed "book an appointment" button, small screens only */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-center py-3 bg-[var(--color-brand-dark-green)]/95 border-t border-[var(--color-brand-cream)]/20">
                <CTA source="Post-op - Sticky mobile" />
            </div>
        </>
    )
}
