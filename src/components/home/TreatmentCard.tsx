import { Link } from "react-router-dom"
import TriangleTreatmentCard from "../../assets/logos/triangleTreatmentCard.svg?react"
import { trackEvent } from "../../utils/analytics"

interface TreatmentCardProps {
  // Image sources
  src400: string
  src800: string
  src1200: string

  // Content
  title: string
  altText: string
  applications: string[]
  applicationsTitle: string

  // Navigation
  linkTo: string
  ariaLabel: string

  // Layout
  isMobile: boolean

  // Analytics
  trackingLabel: string

  // Optional: show CTA button on mobile only
  showMobileCTA?: boolean
  ctaComponent?: React.ReactNode
}

export function TreatmentCard({
  src400,
  src800,
  src1200,
  title,
  altText,
  applications,
  applicationsTitle,
  linkTo,
  ariaLabel,
  isMobile,
  trackingLabel,
  showMobileCTA = false,
  ctaComponent
}: TreatmentCardProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <Link
        to={linkTo}
        aria-label={ariaLabel}
        className="inline-block w-full"
        onClick={() => trackEvent('Homepage Cards', 'Click', trackingLabel)}
      >
        {/* Image with overlay and title card */}
        <div className={`relative overflow-hidden rounded-lg max-w-[350px] w-full mx-auto ${!isMobile ? 'group/image' : ''}`}>
          <img
            src={src800}
            srcSet={`${src400} 400w, ${src800} 800w, ${src1200} 1200w`}
            sizes="(max-width: 767px) 200px, 400px"
            alt={altText}
            className="w-full rounded-lg"
          />

          {/* Dark overlay on hover (desktop) or always slightly visible (mobile) */}
          <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-500 ${isMobile
            ? 'bg-black/10'
            : 'bg-black/0 group-hover/image:bg-black/40'
            }`} />

          {/* Triangle card with treatment title */}
          <div className={`absolute left-0 w-full transition-transform duration-500 ${isMobile
            ? 'bottom-0 translate-y-[25%]'
            : '-bottom-2 translate-y-full group-hover/image:translate-y-[45px]'
            }`}>
            <TriangleTreatmentCard className="w-full" />
            <div className={`absolute inset-0 flex items-center justify-center p-4 ${isMobile
              ? 'bottom-[-5px]'
              : 'bottom-8'
              }`}>
              <h3 className="text-[var(--color-brand-green)] font-semibold text-lg">{title}</h3>
            </div>
          </div>
        </div>
      </Link>

      {/* Applications tags section */}
      {!isMobile ? (
        // Desktop version with hover animation
        <div className="relative group/apps -mt-2 max-w-[350px] w-full">
          <div className="absolute inset-0 bg-[var(--color-brand-dark-green)] -z-10 origin-top scale-y-0 group-hover/apps:scale-y-100 transition-transform duration-500 ease-out rounded-b-lg" />
          <div className="relative z-10 py-2 transition-transform duration-300 group-hover/apps:translate-x-2">
            <h4 className="px-2 py-2 font-bold">{applicationsTitle}</h4>
            <div className="flex flex-wrap gap-1 px-2 pb-2" role="list">
              {applications.map((app, index) => (
                <p
                  key={index}
                  role="listitem"
                  className="w-fit px-4 py-1 border rounded-full group-hover/apps:text-lime-300 group-hover/apps:border-lime-300 transition-colors duration-300"
                >
                  {app}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Mobile version without hover effects
        <div className="py-2 max-w-[350px] w-full mx-auto">
          <h4 className="px-2 pb-2 font-bold">{applicationsTitle}</h4>
          <div className="flex flex-wrap gap-1 px-2 pb-2" role="list">
            {applications.map((app, index) => (
              <p
                key={index}
                role="listitem"
                className="w-fit px-4 py-1 border rounded-full"
              >
                {app}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Optional CTA button (mobile only) */}
      {showMobileCTA && ctaComponent}
    </div>
  )
}
