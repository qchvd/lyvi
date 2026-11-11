import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Clock } from "lucide-react"
import { CTA } from "../header/CTA"
import { trackEvent } from "../../utils/analytics"
import { usePriceAnimation } from "../../hooks/usePriceAnimation"

interface RenataCardProps {
    // Identification (analytics)
    treatmentKey: string

    // Image
    imageSrc: string
    imageAlt: string

    // Content
    title: string
    text: string
    duration: string
    benefits: string[]

    // Pricing (per session, for 1, 5 and 8 sessions packages)
    priceMap: Record<number, number>
    // Savings in euros per number of sessions (none for a single session)
    savingsMap: Record<number, number>

    // Highlighted card ("most booked")
    featured?: boolean
}

const SESSION_COUNTS = [1, 5, 8]

/**
 * Renata França care card ("Lymphatic drainage" page), in the well-being sand colours, with a session selector (1, 5 or 8 sessions).
 */
export function RenataCard({
    treatmentKey,
    imageSrc,
    imageAlt,
    title,
    text,
    duration,
    benefits,
    priceMap,
    savingsMap,
    featured = false
}: RenataCardProps) {
    const { t } = useTranslation(["lymphaticDrainage", "treatments", "ariaLabels"])
    const [selectedSessions, setSelectedSessions] = useState(1)
    const displayedPrice = usePriceAnimation(selectedSessions, priceMap)

    return (
        <article
            className={`flex flex-col h-full rounded-lg overflow-hidden bg-white ${featured
                ? "border-2 border-[var(--color-sand)]"
                : "border border-[var(--color-sand-border)]"
                }`}
        >
            <img src={imageSrc} alt={imageAlt} loading="lazy" className="w-full aspect-[4/3] object-cover" />
            <div className="flex flex-col flex-1 p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-[var(--color-brand-dark-green)]">{title}</h3>
                    {featured && (
                        <span className="px-3 py-1 rounded-full bg-[var(--color-sand)] text-white text-xs font-bold">
                            {t("renata.mostBooked")}
                        </span>
                    )}
                </div>
                <p className="leading-relaxed mt-3 text-[var(--color-sand-text-secondary)]">{text}</p>
                <p className="flex items-center gap-2 mt-3 text-sm font-semibold text-[var(--color-sand-text)]">
                    <Clock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    {duration}
                </p>

                {/* Session selector and price per session */}
                <section aria-label={t("treatments:pricing")} className="rounded-lg bg-[var(--color-sand-bg)] p-4 mt-5 text-center">
                    <div className="flex justify-center gap-2" role="group" aria-label={t("ariaLabels:sessionCount")}>
                        {SESSION_COUNTS.map((sessionCount) => {
                            const isActive = selectedSessions === sessionCount
                            return (
                                <button
                                    key={sessionCount}
                                    type="button"
                                    aria-pressed={isActive}
                                    aria-label={t(`ariaLabels:sessionSelector${sessionCount}`)}
                                    onClick={() => {
                                        setSelectedSessions(sessionCount)
                                        trackEvent('Treatments', 'Session Selection', `${title} - ${sessionCount} session${sessionCount > 1 ? 's' : ''}`)
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-300 ${isActive
                                        ? "bg-[var(--color-sand)] text-white border border-[var(--color-sand)]"
                                        : "bg-white text-[var(--color-sand-text)] border border-[var(--color-sand-border-strong)] hover:border-[var(--color-sand)]"
                                        }`}
                                >
                                    {sessionCount} {sessionCount > 1 ? t("renata.sessions") : t("renata.session")}
                                </button>
                            )
                        })}
                    </div>
                    {/* The visible price counts up and down (animation): hidden from screen readers, which get the final price below instead */}
                    <p className="text-5xl font-bold text-[var(--color-brand-dark-green)] mt-4" aria-hidden="true">
                        {t("renata.price", { price: displayedPrice })}<span className="text-sm font-normal">/{t("renata.session")}</span>
                    </p>
                    <p className={`text-sm mt-1 text-[var(--color-sand-text-secondary)] ${selectedSessions === 1 ? "invisible" : ""}`} aria-hidden="true">
                        {t("treatments:save")} <strong>{savingsMap[selectedSessions] ? t("renata.price", { price: savingsMap[selectedSessions] }) : ""}</strong> {t("treatments:onTreatmentPrice")}
                    </p>
                    {/* Read by screen readers, and announced again when another number of sessions is chosen */}
                    <p className="sr-only" aria-live="polite">
                        {t("renata.price", { price: priceMap[selectedSessions] })}/{t("renata.session")}
                        {savingsMap[selectedSessions] ? `. ${t("treatments:save")} ${t("renata.price", { price: savingsMap[selectedSessions] })} ${t("treatments:onTreatmentPrice")}` : ""}
                    </p>
                </section>

                {/* Benefits */}
                <ul className="flex flex-wrap gap-2 mt-5">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="px-3 py-1 rounded-full bg-[var(--color-sand-light)] text-[var(--color-sand-text)] text-sm">
                            {benefit}
                        </li>
                    ))}
                </ul>

                <div className="mt-auto pt-6 flex justify-center">
                    <CTA variant="sand" source={`${treatmentKey} card`} />
                </div>
            </div>
        </article>
    )
}
