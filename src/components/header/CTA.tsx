import { useTranslation } from "react-i18next"
import { trackEvent } from "../../utils/analytics"
import { DOCTOLIB_URL } from "../../constants/urls"

type CTAProps = {
    className?: string
    source?: string
}

export const CTA = ({ className, source = "Unknown" }: CTAProps) => {
    const { t } = useTranslation("header")

    return (
        <a
            href={DOCTOLIB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('CTA', 'Click', `Doctolib - ${source}`)}
            className={`btn-golden block ${className}`}
        >
            {t("appointment")}
        </a>
    )
}