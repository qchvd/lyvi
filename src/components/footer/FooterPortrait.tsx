import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import portraitFooter from "../../assets/images/portraitFooter.webp"
import { trackEvent } from "../../utils/analytics"

export function FooterPortrait() {
    const { i18n, t } = useTranslation(["footer", "routes"])

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="rounded-full h-51 w-38 overflow-hidden">
                <img
                    src={portraitFooter}
                    alt={t("altAnaïsPortrait")}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            <p className="font-medium">
                <Link
                    to={`/${i18n.language}${t("routes:contact")}`}
                    className="font-thin cursor-pointer underline"
                    onClick={() => trackEvent('Footer', 'Click', 'Contact Link')}
                >
                    {t("contact")}
                </Link> Anaïs
            </p>
        </div>
    )
}
