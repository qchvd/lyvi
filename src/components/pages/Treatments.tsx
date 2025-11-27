import { Header } from "../header/Header"
import { useSidebar } from "../../contexts/SidebarContext"
import { useTranslation } from "react-i18next"
import facialMassageImage from "../../assets/images/facialMassage.webp"
import legMassageImage from "../../assets/images/legMassagePhoto.webp"
import remodelingMassageImage from "../../assets/images/remodelingMassagePhoto.webp"
import { Footer } from "../footer/Footer"
import { motion } from "framer-motion"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { TreatmentPricingCard } from "../treatments/TreatmentPricingCard"

// Helper function to render animated title with staggered fade-in animation
function renderAnimatedTitle(text: string) {
    return text.split("").map((letter, index) => (
        <span
            key={index}
            className="inline-block"
            style={{
                animation: `fadeIn 0.3s ease-out ${0.1 + index * 0.05}s both`
            }}
        >
            {letter}
        </span>
    ))
}

export function Treatments() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation(["treatments", "header", "ariaLabels"])

    // Price maps for each treatment
    const priceMapMiracleFace: Record<number, number> = { 1: 60, 5: 55, 8: 50 }
    const priceMapDrainage: Record<number, number> = { 1: 130, 5: 120, 8: 110 }
    const priceMapRemodelage: Record<number, number> = { 1: 130, 5: 120, 8: 110 }

    // Savings amounts for multi-session packages
    const savingsDrainage: Record<number, string> = { 1: "", 5: "50€", 8: "160€" }
    const savingsRemodelage: Record<number, string> = { 1: "", 5: "50€", 8: "160€" }
    const savingsMiracleFace: Record<number, string> = { 1: "", 5: "25€", 8: "80€" }

    // Filter mappings for benefits
    const filterMappingMiracleFace: Record<string, string[]> = {
        "aesthetic": ["benefitMiracleFace1", "benefitMiracleFace2", "benefitMiracleFace3", "benefitMiracleFace4", "benefitMiracleFace5", "benefitMiracleFace6"],
        "wellness": ["benefitMiracleFace1", "benefitMiracleFace4", "benefitMiracleFace7"],
        "postOp": ["benefitMiracleFace1", "benefitMiracleFace2", "benefitMiracleFace4", "benefitMiracleFace6", "benefitMiracleFace7"]
    }

    const filterMappingDrainage: Record<string, string[]> = {
        "aesthetic": ["benefitDrainage1", "benefitDrainage2", "benefitDrainage3", "benefitDrainage4", "benefitDrainage11"],
        "wellness": ["benefitDrainage1", "benefitDrainage2", "benefitDrainage6", "benefitDrainage7", "benefitDrainage9", "benefitDrainage10", "benefitDrainage11"],
        "maternity": ["benefitDrainage1", "benefitDrainage2", "benefitDrainage3", "benefitDrainage4", "benefitDrainage5", "benefitDrainage6", "benefitDrainage7", "benefitDrainage8", "benefitDrainage9", "benefitDrainage10"],
        "postOp": ["benefitDrainage1", "benefitDrainage2", "benefitDrainage5", "benefitDrainage6", "benefitDrainage7"],
        "sportsRecovery": ["benefitDrainage1", "benefitDrainage2", "benefitDrainage6", "benefitDrainage7", "benefitDrainage8", "benefitDrainage9", "benefitDrainage11"]
    }

    const filterMappingRemodelage: Record<string, string[]> = {
        "aesthetic": ["benefitRemodelage1", "benefitRemodelage2", "benefitRemodelage3", "benefitRemodelage4", "benefitRemodelage5", "benefitRemodelage6", "benefitRemodelage7"],
        "maternity": ["benefitRemodelage1", "benefitRemodelage2", "benefitRemodelage3", "benefitRemodelage4", "benefitRemodelage5", "benefitRemodelage6", "benefitRemodelage7"],
        "postOp": ["benefitRemodelage1", "benefitRemodelage3", "benefitRemodelage4", "benefitRemodelage5"],
    }

    // Filter description functions
    const getFilterDescriptionMiracleFace = (filter: string): string | null => {
        switch (filter) {
            case "postOp":
                return t("postOpDescriptionMiracleFace")
            case "aesthetic":
            case "wellness":
                return null
            default:
                return null
        }
    }

    const getFilterDescriptionDrainage = (filter: string): string | null => {
        switch (filter) {
            case "postOp":
                return t("postOpDescriptionDrainage")
            case "maternity":
                return t("maternityDescriptionDrainage")
            case "aesthetic":
            case "wellness":
            case "sportsRecovery":
                return null
            default:
                return null
        }
    }

    // Benefits arrays (translation keys)
    const benefitsMiracleFace = [
        "benefitMiracleFace1",
        "benefitMiracleFace2",
        "benefitMiracleFace3",
        "benefitMiracleFace4",
        "benefitMiracleFace5",
        "benefitMiracleFace6",
        "benefitMiracleFace7"
    ]

    const benefitsDrainage = [
        "benefitDrainage1",
        "benefitDrainage2",
        "benefitDrainage3",
        "benefitDrainage4",
        "benefitDrainage5",
        "benefitDrainage6",
        "benefitDrainage7",
        "benefitDrainage8",
        "benefitDrainage9",
        "benefitDrainage10",
        "benefitDrainage11"
    ]

    const benefitsRemodelage = [
        "benefitRemodelage1",
        "benefitRemodelage2",
        "benefitRemodelage3",
        "benefitRemodelage4",
        "benefitRemodelage5",
        "benefitRemodelage6",
        "benefitRemodelage7"
    ]

    return (
        <>
            <Header />
            <main inert={isSidebarOpen ? true : undefined} className="pt-18 px-8 lg:px-10 min-h-screen" style={{ containerType: 'inline-size' }}>
                <h1 className="font-bold my-2 fluid-treatments-title1" aria-label={t("ariaLabels:treatmentsTypeWriterTitle")}>
                    {i18n.language === "fr"
                        ? renderAnimatedTitle("SOINS")
                        : i18n.language === "de"
                        ? renderAnimatedTitle("BEHANDLUNGEN")
                        : renderAnimatedTitle("TREATMENTS")
                    }
                </h1>
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center md:flex-row md:flex-wrap md:justify-center md:items-start gap-12"
                >
                    <TreatmentPricingCard
                        treatmentName="Drainage"
                        treatmentKey="drainage"
                        imageSrc={legMassageImage}
                        imageAlt={t("altDrainagePicture")}
                        catchPhrase={<>{t("drainageCatchPhrase1stPart")} <strong>{t("andThatShows")}</strong> {t("drainageCatchPhrase2ndPart")}</>}
                        duration={t("durationDrainage")}
                        priceMap={priceMapDrainage}
                        savingsMap={savingsDrainage}
                        benefits={benefitsDrainage}
                        filterMapping={filterMappingDrainage}
                        getFilterDescription={getFilterDescriptionDrainage}
                        showMostBookedBadge={true}
                    />

                    <TreatmentPricingCard
                        treatmentName={t("remodelage")}
                        treatmentKey="remodelage"
                        imageSrc={remodelingMassageImage}
                        imageAlt={t("altRemodelagePicture")}
                        catchPhrase={t("remodelageCatchPhrase")}
                        duration={t("durationRemodelage")}
                        priceMap={priceMapRemodelage}
                        savingsMap={savingsRemodelage}
                        benefits={benefitsRemodelage}
                        filterMapping={filterMappingRemodelage}
                        customTitleClass={`mt-4 ${i18n.language === "de" ? "text-[1.8rem]" : "text-4xl"}`}
                    />

                    <TreatmentPricingCard
                        treatmentName="Miracle face"
                        treatmentKey="miracleFace"
                        imageSrc={facialMassageImage}
                        imageAlt={t("altMiracleFacePicture")}
                        catchPhrase={t("miracleFaceCatchPhrase")}
                        duration={t("durationMiracleFace")}
                        priceMap={priceMapMiracleFace}
                        savingsMap={savingsMiracleFace}
                        benefits={benefitsMiracleFace}
                        filterMapping={filterMappingMiracleFace}
                        getFilterDescription={getFilterDescriptionMiracleFace}
                    />
                </motion.div>
            </main >
            <Footer />
        </>
    )
}