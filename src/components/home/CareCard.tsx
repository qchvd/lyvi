import { Link } from "react-router-dom"
import { CareBadge } from "../CareBadge"
import { trackEvent } from "../../utils/analytics"

interface CareCardProps {
  // Image
  src: string
  srcSet?: string
  altText: string

  // Content
  title: string
  badges: ("medical" | "wellness")[]
  text: string

  // Navigation
  linkTo: string
  discoverLabel: string

  // Layout
  isMobile: boolean

  // Analytics
  trackingLabel: string
}

// Home care card: picture with the title always visible below it
export function CareCard({
  src,
  srcSet,
  altText,
  title,
  badges,
  text,
  linkTo,
  discoverLabel,
  isMobile,
  trackingLabel
}: CareCardProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[350px] h-full">
      {/* Same destination as the "Discover" button: kept clickable for the mouse, but skipped by keyboard and screen readers to avoid a double link */}
      <Link
        to={linkTo}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block w-full overflow-hidden rounded-lg ${!isMobile ? 'group/image' : ''}`}
        onClick={() => trackEvent('Homepage Cards', 'Click', trackingLabel)}
      >
        <img
          src={src}
          srcSet={srcSet}
          sizes="(max-width: 767px) 100vw, 350px"
          alt={altText}
          loading="lazy"
          className="w-full aspect-[2/3] object-cover rounded-lg"
        />

        {/* Dark overlay on hover (desktop) or always slightly visible (mobile) */}
        <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-500 ${isMobile
          ? 'bg-black/10'
          : 'bg-black/0 group-hover/image:bg-black/40'
          }`} />
      </Link>

      <div className="flex flex-col flex-1 w-full px-2 mt-5">
        <h3 className="font-semibold text-xl leading-snug">
          {/* Hyphenated words (e.g. "post-partum") stay whole instead of wrapping at the hyphen */}
          {title.split(" ").map((word, index) => (
            <span key={index}>
              {index > 0 && " "}
              {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
            </span>
          ))}
        </h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {badges.map((badge) => (
            <CareBadge key={badge} type={badge} />
          ))}
        </div>
        <p className="mt-4 leading-relaxed">{text}</p>

        {/* Pushed to the bottom so the buttons line up across cards */}
        <div className="mt-auto pt-5 flex justify-center">
          <Link
            to={linkTo}
            className="btn-golden block"
            onClick={() => trackEvent('Homepage Cards', 'Click', `${trackingLabel} - Discover`)}
          >
            {discoverLabel}
            {/* Tells screen readers which care the button leads to (three identical "Discover" otherwise) */}
            <span className="sr-only"> – {title}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
