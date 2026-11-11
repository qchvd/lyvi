import { useTranslation } from "react-i18next"

type CareBadgeProps = {
    type: "medical" | "wellness"
    className?: string
}

// Small label telling medical care apart from well-being care, reusable on any page
export const CareBadge = ({ type, className = "" }: CareBadgeProps) => {
    const { t } = useTranslation("header")

    return (
        <span className={`care-badge care-badge-${type} ${className}`}>
            {t(`careBadges.${type}`)}
        </span>
    )
}
