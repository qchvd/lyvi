import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { AnimatePresence, motion } from "framer-motion"
import ConfirmationTick from "../../assets/logos/ConfirmationTick.svg?react"
import DownArrow from "../../assets/logos/DownArrow.svg?react"
import { CTA } from "../header/CTA"
import { Separator } from "./Separator"
import { trackEvent } from "../../utils/analytics"
import { usePriceAnimation } from "../../hooks/usePriceAnimation"

interface TreatmentPricingCardProps {
    // Treatment identification
    treatmentName: string
    treatmentKey: string // For analytics and CTA source tracking

    // Image
    imageSrc: string
    imageAlt: string

    // Content
    catchPhrase: React.ReactNode
    duration: string

    // Pricing
    priceMap: Record<number, number>
    savingsMap: Record<number, string> // Maps sessions to savings text (e.g., "50€", "160€")

    // Benefits and filters
    benefits: string[]
    filterMapping: Record<string, string[]>
    getFilterDescription?: (filter: string) => string | null

    // Optional features
    showMostBookedBadge?: boolean
    customTitleClass?: string
}

/**
 * Reusable treatment pricing card component
 * Displays treatment info, pricing with session selector, benefits list, and filters
 */
export function TreatmentPricingCard({
    treatmentName,
    treatmentKey,
    imageSrc,
    imageAlt,
    catchPhrase,
    duration,
    priceMap,
    savingsMap,
    benefits,
    filterMapping,
    getFilterDescription,
    showMostBookedBadge = false,
    customTitleClass
}: TreatmentPricingCardProps) {
    const { i18n, t } = useTranslation(["treatments", "ariaLabels"])
    const [selectedSessions, setSelectedSessions] = useState(1)
    const buttonRefs = useRef<Record<number, HTMLDivElement | null>>({})
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [_mounted, setMounted] = useState(false)

    // Use custom hook for smooth price animation
    const displayedPrice = usePriceAnimation(selectedSessions, priceMap)

    // Force re-render after mount to ensure slider appears
    useEffect(() => {
        setMounted(true)
    }, [])

    /**
     * Calculate slider style based on selected button position
     * Returns position, size, and opacity for the animated slider background
     */
    const getSliderStyle = () => {
        const button = buttonRefs.current[selectedSessions]
        if (!button) return { opacity: 0 }

        return {
            transform: `translateX(${button.offsetLeft - 2}px)`,
            width: `${button.offsetWidth}px`,
            height: `${button.offsetHeight}px`,
            opacity: 1
        }
    }

    const handleFilterClick = (filter: string) => {
        setActiveFilter(activeFilter === filter ? null : filter)
        trackEvent('Treatments', 'Filter Click', `${treatmentName} - ${filter}`)
    }

    return (
        <article className="w-75 md:w-80 lg:w-85 h-fit pb-10 shadow-md rounded-lg overflow-hidden bg-[var(--color-brand-dark-green)]">
            <img src={imageSrc} alt={imageAlt} className="w-full h-auto" fetchPriority="high" />
            <div className="flex flex-col items-center px-5 gap-6">
                {/* Header */}
                <header className="flex flex-col items-center gap-3">
                    <h2 className={customTitleClass || "mt-4 text-4xl"}>{treatmentName}</h2>
                    <p className="text-justify leading-relaxed">
                        {catchPhrase}
                    </p>
                    <p>
                        {duration}
                    </p>
                </header>

                <Separator />

                {/* Pricing section */}
                <section
                    aria-labelledby={`price-${treatmentKey}`}
                    className={showMostBookedBadge ? "relative min-w-[290px]" : undefined}
                >
                    {showMostBookedBadge && (
                        <>
                            <DownArrow
                                aria-hidden="true"
                                className={`absolute top-10 h-9 fill-[var(--color-brand-cream)] pointer-events-none ${i18n.language === "de" ? "left-25" : "left-27"}`}
                            />
                            <div className={`absolute rounded-full pointer-events-none text-[var(--color-brand-dark-green)] bg-gradient-to-br from-[var(--color-golden-light)] via-[var(--color-golden-mid)] to-[var(--color-golden-dark)] py-1 px-2 h-fit w-fit text-sm font-medium whitespace-nowrap ${i18n.language === "de" ? "left-22" : "left-31"}`}>
                                {`⭐ ${t("theMostBooked")}`}
                            </div>
                        </>
                    )}

                    <h3 id={`price-${treatmentKey}`} className="sr-only">{t("pricing")}</h3>
                    <div className={`flex flex-col items-center ${showMostBookedBadge ? "mt-23 min-w-[290px]" : ""}`}>
                        {/* Session selector */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-full bg-[var(--color-brand-cream)] p-[2px]">
                                <div className="w-full h-fit p-[2px] rounded-full bg-[var(--color-brand-dark-green)] flex items-center gap-1 relative">
                                    {/* Animated slider background */}
                                    <div
                                        className="absolute rounded-full bg-gradient-to-br from-[var(--color-golden-light)] via-[var(--color-golden-mid)] to-[var(--color-golden-dark)] transition-all duration-300 ease-in-out"
                                        style={getSliderStyle()}
                                    />

                                    {/* Session buttons */}
                                    {[1, 5, 8].map((sessionCount) => (
                                        <div
                                            key={sessionCount}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={t(`ariaLabels:sessionSelector${sessionCount}`)}
                                            onKeyDown={(e) => e.key === 'Enter' && setSelectedSessions(sessionCount)}
                                            ref={el => { buttonRefs.current[sessionCount] = el }}
                                            onClick={() => {
                                                setSelectedSessions(sessionCount)
                                                trackEvent('Treatments', 'Session Selection', `${treatmentName} - ${sessionCount} session${sessionCount > 1 ? 's' : ''}`)
                                            }}
                                            style={sessionCount === 5 && showMostBookedBadge ? {
                                                boxShadow: '0 0 15px rgba(201, 169, 97, 0.6), 0 0 25px rgba(201, 169, 97, 0.4), 0 0 35px rgba(201, 169, 97, 0.2)'
                                            } : undefined}
                                            className={`w-8 h-8 rounded-full flex justify-center items-center hover:cursor-pointer relative z-5 ${selectedSessions !== sessionCount ? 'hover:bg-[var(--color-brand-dark-green-hover)]' : ''} ${selectedSessions === sessionCount ? 'text-[var(--color-brand-dark-green)]' : ''}`}
                                        >
                                            {sessionCount}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p>
                                {t("session")}<span className={selectedSessions === 1 ? 'invisible' : ''}>{i18n.language === "de" ? "en" : "s"}</span>
                            </p>
                        </div>

                        {/* Price display */}
                        <p className="text-[5.5rem] md:text-8xl mt-4">
                            {displayedPrice}€<span className="text-sm">/{t("session")}</span>
                        </p>
                        <p className={`mt-1 text-center ${selectedSessions === 1 ? 'invisible' : ''}`}>
                            {t("save")} <strong>{savingsMap[selectedSessions]}</strong> {t("onTreatmentPrice")}
                        </p>
                    </div>
                </section>

                <Separator />

                {/* Benefits list */}
                <div className="w-full flex flex-col gap-3">
                    <h3>{t("benefits")}</h3>
                    <ul className="pl-4 flex flex-col gap-2">
                        {benefits.map((benefitKey) => (
                            <li
                                key={benefitKey}
                                className={`flex items-center gap-3 transition-opacity ${activeFilter && !filterMapping[activeFilter]?.includes(benefitKey) ? 'opacity-20' : 'opacity-100'}`}
                            >
                                <ConfirmationTick className="h-4 w-4 flex-shrink-0 fill-[var(--color-golden-mid)]" />
                                <p>{t(benefitKey)}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <Separator />

                {/* Filter buttons */}
                <div className="flex flex-col gap-4" role="group" aria-labelledby={`filter-label-${treatmentKey}`}>
                    <h3 id={`filter-label-${treatmentKey}`} className="text-center">{t("selectAFilter")}</h3>
                    <div className="flex flex-wrap justify-center gap-1">
                        {Object.keys(filterMapping).map((key, index) => (
                            <p
                                key={index}
                                role="button"
                                tabIndex={0}
                                aria-pressed={activeFilter === key}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterClick(key)}
                                onClick={() => handleFilterClick(key)}
                                className={`w-fit px-4 py-1 border rounded-full hover:cursor-pointer transition-all duration-300 ${activeFilter === key ? 'border-solid border-[var(--color-brand-cream)] bg-[var(--color-brand-cream)] text-[var(--color-brand-dark-green)]' : 'border-dashed'}`}
                            >
                                {t(key)}
                            </p>
                        ))}
                    </div>

                    {/* Optional filter description with animation */}
                    {getFilterDescription && (
                        <AnimatePresence initial={false}>
                            {activeFilter !== null && getFilterDescription(activeFilter) && (
                                <motion.div
                                    key={activeFilter}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-justify leading-relaxed">
                                        {getFilterDescription(activeFilter)}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                <Separator />

                {/* CTA button */}
                <footer>
                    <CTA source={`${treatmentName} card`} />
                </footer>
            </div>
        </article>
    )
}
