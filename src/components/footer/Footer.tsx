import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../hooks/useIsMobile"
import InstagramLogo from "../../assets/logos/InstagramLogo.svg?react"
import DoctolibLogo from "../../assets/logos/DoctolibLogo.svg?react"
import { trackEvent } from "../../utils/analytics"
import { useSidebar } from "../../contexts/SidebarContext"
import { FooterPortrait } from "./FooterPortrait"
import { CONTACT_INFO } from "../../constants/contactInfo"
import { DOCTOLIB_URL, INSTAGRAM_URL, GOOGLE_MAPS_URL } from "../../constants/urls"

export function Footer() {
    const { t } = useTranslation(["footer", "routes", "contact", "ariaLabels"])
    const isMobile = useIsMobile()
    const { isSidebarOpen } = useSidebar()

    return (
        <>
            <div className="w-full overflow-hidden leading-none">
                <svg
                    viewBox="0 0 1440 80"
                    preserveAspectRatio="none"
                    className="block w-full mt-6 h-12 md:h-20"
                >
                    <path
                        d="M0,0 Q720,80 1440,0 L1440,80 L0,80 Z"
                        className="fill-[#2d3b23]"
                    />
                </svg>
            </div>

            <footer inert={isSidebarOpen ? true : undefined} className="bg-[#2d3b23] px-6 pt-6 pb-10">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mx-auto max-w-5xl gap-8">
                    <div className="flex flex-col items-center gap-7">
                        <div className="lg:hidden">
                            <FooterPortrait />
                        </div>
                        <h1 className="text-6xl text-center">LET'S TALK</h1>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-0">
                            <div className="flex flex-col items-center text-center min-w-60">
                                <h2 className="text-2xl font-thin text-[#94a582]">{t("contact:address.label")}</h2>
                                <p>{t("home")} <br />{t("or")}</p>
                                <address className="not-italic leading-6">
                                    <a
                                        href={GOOGLE_MAPS_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`cursor-pointer ${isMobile ? "underline" : "hover:underline"}`}
                                    >
                                        {CONTACT_INFO.address.name}<br />
                                        {CONTACT_INFO.address.street()}<br />
                                        {CONTACT_INFO.address.city}<br />
                                        {CONTACT_INFO.address.country}
                                    </a>
                                </address>
                            </div>
                            <div className="flex flex-col items-center text-center min-w-60">
                                <h2 className="text-2xl font-thin text-[#94a582]">{t("contact:form.phone.label")}</h2>
                                {isMobile ? (
                                    <a
                                        href={`tel:${CONTACT_INFO.phone}`}
                                        className="whitespace-nowrap underline"
                                        onClick={() => trackEvent('Footer', 'Click', 'Phone')}
                                    >
                                        {CONTACT_INFO.phoneDisplay}
                                    </a>
                                ) : (
                                    <span className="whitespace-nowrap">
                                        {CONTACT_INFO.phoneDisplay}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-center text-center min-w-60">
                                <h2 className="text-2xl font-thin text-[#94a582]">{t("contact:form.email.label")}</h2>
                                <a
                                    href={`mailto:${CONTACT_INFO.email}`}
                                    rel="noopener noreferrer"
                                    className="underline"
                                    onClick={() => trackEvent('Footer', 'Click', 'Email')}
                                >
                                    {CONTACT_INFO.email}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <a
                                href={INSTAGRAM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t("ariaLabels:instagramLink")}
                                onClick={() => trackEvent('Footer', 'Click', 'Instagram')}
                            >
                                <InstagramLogo className="w-7 fill-[#FAF2E8]" aria-hidden="true" />
                            </a>
                            <a
                                href={DOCTOLIB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t("ariaLabels:doctolibLink")}
                                onClick={() => trackEvent('Footer', 'Click', 'Doctolib')}
                            >
                                <DoctolibLogo className="w-6 fill-[#FAF2E8]" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                    <div className="hidden lg:flex">
                        <FooterPortrait />
                    </div>
                </div>
            </footer >
        </>
    )
}