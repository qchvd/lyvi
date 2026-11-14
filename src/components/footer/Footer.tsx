import { Trans, useTranslation } from "react-i18next"
import { useIsMobile } from "../../hooks/useIsMobile"
import InstagramLogo from "../../assets/logos/InstagramLogo.svg?react"
import DoctolibLogo from "../../assets/logos/DoctolibLogo.svg?react"
import { trackEvent } from "../../utils/analytics"
import { useSidebar } from "../../contexts/SidebarContext"
import { FooterPortrait } from "./FooterPortrait"
import { CONTACT_INFO } from "../../constants/contactInfo"
import { DOCTOLIB_URL, INSTAGRAM_URL, GOOGLE_MAPS_URL, GOOGLE_MAPS_LYON5_URL } from "../../constants/urls"

export function Footer() {
    const { t } = useTranslation(["footer", "routes", "contact", "ariaLabels"])
    const isMobile = useIsMobile()
    const addressLinkClassName = `cursor-pointer ${isMobile ? "underline" : "hover:underline"}`
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

            <footer id="contact" inert={isSidebarOpen ? true : undefined} className="bg-[#2d3b23] px-6 pt-6 pb-10">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mx-auto max-w-5xl gap-8">
                    <div className="flex flex-col items-center gap-7">
                        <div className="lg:hidden">
                            <FooterPortrait />
                        </div>
                        {/* Styled like a title but not a heading, so each page keeps a single h1 */}
                        <p className="text-6xl text-center" lang="en">LET'S TALK</p>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-0">
                            <div className="flex flex-col items-center text-center min-w-60">
                                <h2 className="text-2xl font-thin text-[#94a582]">{t("addressesLabel")}</h2>
                                <address className="not-italic leading-6 flex flex-col gap-4">
                                    <a
                                        href={GOOGLE_MAPS_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={addressLinkClassName}
                                    >
                                        {t("lyon1.name")}<br />
                                        {CONTACT_INFO.address.street}, <Trans t={t} i18nKey="lyon1.floor" components={{ sup: <sup /> }} /><br />
                                        {CONTACT_INFO.address.city}<br />
                                        {t("lyon1.conditions")}
                                        <span className="sr-only"> {t("ariaLabels:newTab")}</span>
                                    </a>
                                    <a
                                        href={GOOGLE_MAPS_LYON5_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={addressLinkClassName}
                                    >
                                        {t("lyon5.name")}<br />
                                        {CONTACT_INFO.addressLyon5.place}<br />
                                        {CONTACT_INFO.addressLyon5.street}<br />
                                        {CONTACT_INFO.addressLyon5.city}<br />
                                        {t("lyon5.conditions")}
                                        <span className="sr-only"> {t("ariaLabels:newTab")}</span>
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
                                aria-label={`${t("ariaLabels:instagramLink")} ${t("ariaLabels:newTab")}`}
                                onClick={() => trackEvent('Footer', 'Click', 'Instagram')}
                            >
                                <InstagramLogo className="w-7 fill-[#FAF2E8]" aria-hidden="true" />
                            </a>
                            <a
                                href={DOCTOLIB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${t("ariaLabels:doctolibLink")} ${t("ariaLabels:newTab")}`}
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