import Star from "../../assets/logos/star.svg?react"

/**
 * Decorative separator component with centered star icon
 * Used to visually separate sections within treatment cards
 */
export function Separator() {
    return (
        <div className="w-full flex justify-between items-center" role="separator" aria-hidden="true">
            <div className="h-[1px] w-8/19 bg-[var(--color-brand-cream)]"></div>
            <Star className="w-6 fill-[var(--color-golden-mid)]" />
            <div className="h-[1px] w-8/19 bg-[var(--color-brand-cream)]"></div>
        </div>
    )
}
