import { useTranslation } from "react-i18next"
import { trackEvent } from "../../utils/analytics"
import { DOCTOLIB_URL } from "../../constants/urls"

type CTAProps = {
    className?: string
    source?: string
    // Button colour: golden everywhere by default, terracotta on the post-partum page, sand for Renata França care
    variant?: "golden" | "terracotta" | "sand"
}

export const CTA = ({ className, source = "Unknown", variant = "golden" }: CTAProps) => {
    const { t } = useTranslation(["header", "ariaLabels"])

    return (
        <a
            href={DOCTOLIB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('CTA', 'Click', `Doctolib - ${source}`)}
            className={`btn-${variant} block ${className}`}
        >
            {t("appointment")}
            <span className="sr-only"> {t("ariaLabels:newTab")}</span>
        </a>
    )
}