import { Header } from "../header/Header"
import { useSidebar } from "../../contexts/SidebarContext"
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { useTranslation } from "react-i18next"
import { useWindowWidth } from "../../hooks/useWindowWidth"
import drainagePicture400 from "../../assets/images/optimized/drainagePicture-400w.webp"
import drainagePicture800 from "../../assets/images/optimized/drainagePicture-800w.webp"
import drainagePicture1200 from "../../assets/images/optimized/drainagePicture-1200w.webp"
import postOpMarkingPicture400 from "../../assets/images/optimized/postOpMarkingPicture-400w.webp"
import postOpMarkingPicture800 from "../../assets/images/optimized/postOpMarkingPicture-800w.webp"
import { Footer } from "../footer/Footer"
import { useIsMobile } from "../../hooks/useIsMobile"
import { motion, useReducedMotion } from "framer-motion"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { CTA } from "../header/CTA"
import { Helmet } from "react-helmet-async"
import { CareCard } from "../home/CareCard"
import { CareBadge } from "../CareBadge"
import { Link } from "react-router-dom"
import { trackEvent } from "../../utils/analytics"

// Letter-by-letter reveal of the title lines
// Each word is kept whole so lines only wrap between words; the delay runs on from one line to the next
function renderTypedLines(lines: string[]) {
  let letterIndex = 0

  return lines.map((line, lineIndex) => (
    <span key={lineIndex} className="block">
      {line.split(" ").map((word, wordIndex) => (
        <span key={wordIndex}>
          {wordIndex > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((letter, i) => (
              <span
                key={i}
                className="hero-title-letter"
                style={{ animationDelay: `${0.1 + letterIndex++ * 0.025}s` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  ))
}

// Scrolls to the contact details in the footer without adding "#contact" to the URL
function scrollToFooterContact(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const target = document.getElementById("contact")
    if (!target) return
    // The footer starts right below the fixed header
    const headerHeight = document.querySelector("header")?.offsetHeight ?? 72
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight
    if (window.lenis) {
        window.lenis.scrollTo(top)
    } else {
        window.scrollTo({ top, behavior: "smooth" })
    }
}

export function Home() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation(["home", "routes", "ariaLabels"])
    const windowWidth = useWindowWidth()
    const leftRef = useRef<HTMLDivElement>(null)
    const [leftHeight, setLeftHeight] = useState<number>(0)
    const isMobile = useIsMobile()
    const carouselAlts = t("carouselImages", { returnObjects: true }) as string[]
    const reduceMotion = useReducedMotion()
    const titleLines = t("hero.titleLines", { returnObjects: true }) as string[]

    // ===== RESIZE OBSERVER =====
    // Syncs the carousel height with the left content section height
    // This ensures the carousel always matches the height of the text content on desktop layouts
    useEffect(() => {
        if (!leftRef.current) return

        const resizeObserver = new ResizeObserver(entries => {
            const height = entries[0].contentRect.height
            setLeftHeight(height)
        })

        resizeObserver.observe(leftRef.current)

        return () => resizeObserver.disconnect()
    }, [i18n.language])

    const images = [
        {
            src400: "/images/optimized/home/drainage-1024x2218-400w.webp",
            src800: "/images/optimized/home/drainage-1024x2218-800w.webp",
            src1200: "/images/optimized/home/drainage-1024x2218-1200w.webp",
            srcFallback: "/images/home/drainage-1024x2218.webp",
        },
        {
            src400: "/images/optimized/home/remodelage-1024x2218-400w.webp",
            src800: "/images/optimized/home/remodelage-1024x2218-800w.webp",
            src1200: "/images/optimized/home/remodelage-1024x2218-1200w.webp",
            srcFallback: "/images/home/remodelage-1024x2218.webp",
        },
        {
            src400: "/images/optimized/home/miracleFace-1024x2218-400w.webp",
            src800: "/images/optimized/home/miracleFace-1024x2218-800w.webp",
            src1200: "/images/optimized/home/miracleFace-1024x2218-1200w.webp",
            srcFallback: "/images/home/miracleFace-1024x2218.webp",
        },
        {
            src400: "/images/optimized/home/massageSetup-1024x2218-400w.webp",
            src800: "/images/optimized/home/massageSetup-1024x2218-800w.webp",
            src1200: "/images/optimized/home/massageSetup-1024x2218-1200w.webp",
            srcFallback: "/images/home/massageSetup-1024x2218.webp",
        },
    ]

    // ===== CAROUSEL DIMENSION CALCULATIONS =====
    // These calculations determine the size and positioning of the image carousel
    // based on the available screen space and layout constraints

    const baseWidth = 1440
    const scale = Math.min(windowWidth / baseWidth, 1)

    // Image aspect ratio (height / width) - original image dimensions
    const aspectRatio = 2218 / 1024

    // Calculate available width for carousel considering horizontal padding (40px on each side)
    const paddingTotal = windowWidth >= 768 ? 80 : 80
    const isMobileLandscape = windowWidth >= 768 && windowWidth <= 932 && window.matchMedia('(orientation: landscape)').matches
    const shouldStack = windowWidth < 768 || isMobileLandscape
    const availableWidth = shouldStack
        ? windowWidth - paddingTotal
        : (windowWidth / 2) - paddingTotal

    // Calculate max carousel width (visible portion = 1 full image + 3 partially visible images at 21.6% spacing)
    const maxCarouselWidth = availableWidth
    const maxImageWidth = maxCarouselWidth / (1 + 3 * 0.216)

    // Calculate image height that would result from the calculated width
    const imageHeightFromWidth = maxImageWidth * aspectRatio

    // Determine final image dimensions by constraining to available vertical space
    const maxHeight = leftHeight  // Height of the left content section (synced via ResizeObserver)
    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    const mobileOrPortraitHeight = windowWidth < 768 || (windowWidth < 1024 && isPortrait) || isMobileLandscape ? 600 : maxHeight
    const imageHeight = Math.min(mobileOrPortraitHeight, imageHeightFromWidth)
    const imageWidth = imageHeight / aspectRatio

    // Calculate spacing between stacked images and total carousel container width
    const imageSpacing = imageWidth * 0.216
    const carouselWidth = 3 * imageSpacing + imageWidth

    // ===== CAROUSEL ANIMATION DISTANCES =====
    // Calculate how far images move during the carousel cycle animation
    const isSmallScreen = windowWidth < 768
    const returnAdjustment = isSmallScreen ? 1.3 : 1

    const forwardDistance = imageWidth - imageSpacing + 25 * scale  // Moving images forward
    const returnDistance = (imageWidth - imageSpacing + 150 * scale) * returnAdjustment  // Returning backward
    const leftDistance = forwardDistance  // Moving left at end of cycle
    const movingDuration = 500  // Animation duration in ms

    // ===== CAROUSEL STATE =====
    // Manages the position (translateX), layering (zIndex), and front status of each image
    const [imageStates, setImageStates] = useState(
        images.map((_, idx) => ({
            translateX: 0,
            zIndex: 40 - idx * 10,
            isFront: idx === 0,
        }))
    )

    const [cycle, setCycle] = useState(0)

    // Get next image index based on current cycle (determines which image moves next)
    function getNextIndexForCycle(c: number) {
        switch (c) {
            case 0: return 1
            case 1: return 2
            case 2: return 3
            case 3: return 2
            case 4: return 1
            case 5: return 0
            default: return 0
        }
    }

    // ===== CAROUSEL ANIMATION CYCLE =====
    // Automatic carousel animation that cycles through 6 states, showing all 4 images
    // Cycle: 0→1→2→3 (forward), then 3→2→1→0 (backward return)
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = getNextIndexForCycle(cycle)

            // Determine animation direction and distance for this cycle step
            let direction: "right" | "left" = "right"
            let distance = forwardDistance
            if (cycle === 3 || cycle === 4) {
                distance = returnDistance  // Cycles 3-4: move backward
            }
            if (cycle === 5) {
                direction = "left"  // Cycle 5: final return to start
                distance = leftDistance
            }

            const tx = direction === "right" ? distance : -distance

            const snapshot = [...imageStates]
            const specialCase2Over4DuringReturn = nextIndex === 1 && cycle === 4

            setImageStates(prev =>
                prev.map((s, idx) => {
                    if (idx === nextIndex) {
                        if (specialCase2Over4DuringReturn) {
                            const z3 = snapshot[2]?.zIndex ?? 20
                            const z4 = snapshot[3]?.zIndex ?? 10
                            const tempZ = Math.min(z3 - 1, Math.max(s.zIndex, z4 + 1))
                            return { ...s, translateX: tx, zIndex: tempZ }
                        }
                        return { ...s, translateX: tx }
                    }
                    return s
                })
            )

            // After animation completes, reset positions and update z-index order for next cycle
            setTimeout(() => {
                setImageStates(() => {
                    switch (cycle) {
                        case 0:
                            return [
                                { translateX: 0, zIndex: 30, isFront: false },
                                { translateX: 0, zIndex: 40, isFront: true },
                                { translateX: 0, zIndex: 20, isFront: false },
                                { translateX: 0, zIndex: 10, isFront: false },
                            ]
                        case 1:
                            return [
                                { translateX: 0, zIndex: 20, isFront: false },
                                { translateX: 0, zIndex: 30, isFront: false },
                                { translateX: 0, zIndex: 40, isFront: true },
                                { translateX: 0, zIndex: 10, isFront: false },
                            ]
                        case 2:
                            return [
                                { translateX: 0, zIndex: 10, isFront: false },
                                { translateX: 0, zIndex: 20, isFront: false },
                                { translateX: 0, zIndex: 30, isFront: false },
                                { translateX: 0, zIndex: 40, isFront: true },
                            ]
                        case 3:
                            return [
                                { translateX: 0, zIndex: 10, isFront: false },
                                { translateX: 0, zIndex: 20, isFront: false },
                                { translateX: 0, zIndex: 40, isFront: true },
                                { translateX: 0, zIndex: 30, isFront: false },
                            ]
                        case 4:
                            return [
                                { translateX: 0, zIndex: 10, isFront: false },
                                { translateX: 0, zIndex: 40, isFront: true },
                                { translateX: 0, zIndex: 30, isFront: false },
                                { translateX: 0, zIndex: 20, isFront: false },
                            ]
                        case 5:
                            return [
                                { translateX: 0, zIndex: 40, isFront: true },
                                { translateX: 0, zIndex: 30, isFront: false },
                                { translateX: 0, zIndex: 20, isFront: false },
                                { translateX: 0, zIndex: 10, isFront: false },
                            ]
                        default:
                            return [
                                { translateX: 0, zIndex: 40, isFront: true },
                                { translateX: 0, zIndex: 30, isFront: false },
                                { translateX: 0, zIndex: 20, isFront: false },
                                { translateX: 0, zIndex: 10, isFront: false },
                            ]
                    }
                })
                setCycle(prev => (prev + 1) % 6)
            }, movingDuration)
        }, 4000)

        return () => clearInterval(interval)
    }, [cycle, forwardDistance, returnDistance, leftDistance, imageStates, movingDuration])

    return (
        <>
        <Helmet>
        {/* Picture 1 - Drainage */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/optimized/home/drainage-1024x2218-800w.webp"
          imageSrcSet="/images/optimized/home/drainage-1024x2218-400w.webp 400w, /images/optimized/home/drainage-1024x2218-800w.webp 800w, /images/optimized/home/drainage-1024x2218-1200w.webp 1200w"
          imageSizes="(max-width: 767px) 200px, 300px"
          fetchPriority="high"
        />

        {/* Picture 2 - Remodelage */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/optimized/home/remodelage-1024x2218-800w.webp"
          imageSrcSet="/images/optimized/home/remodelage-1024x2218-400w.webp 400w, /images/optimized/home/remodelage-1024x2218-800w.webp 800w, /images/optimized/home/remodelage-1024x2218-1200w.webp 1200w"
          imageSizes="(max-width: 767px) 200px, 300px"
          fetchPriority="high"
        />

        {/* Picture 3 - MiracleFace */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/optimized/home/miracleFace-1024x2218-800w.webp"
          imageSrcSet="/images/optimized/home/miracleFace-1024x2218-400w.webp 400w, /images/optimized/home/miracleFace-1024x2218-800w.webp 800w, /images/optimized/home/miracleFace-1024x2218-1200w.webp 1200w"
          imageSizes="(max-width: 767px) 200px, 300px"
          fetchPriority="high"
        />

        {/* Picture 4 - Massage Setup */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/optimized/home/massageSetup-1024x2218-800w.webp"
          imageSrcSet="/images/optimized/home/massageSetup-1024x2218-400w.webp 400w, /images/optimized/home/massageSetup-1024x2218-800w.webp 800w, /images/optimized/home/massageSetup-1024x2218-1200w.webp 1200w"
          imageSizes="(max-width: 767px) 200px, 300px"
          fetchPriority="high"
        />
      </Helmet>
            <Header />
            <main id="main-content" inert={isSidebarOpen ? true : undefined} className="pt-18 min-h-screen overflow-x-hidden">
                <div
                    className={`flex ${shouldStack ? 'flex-col' : 'md:flex-row'} py-8 md:py-10`}
                    style={{
                        // The hero may grow beyond the screen height instead of overflowing
                        minHeight: !shouldStack && window.matchMedia('(orientation: landscape)').matches
                            ? `calc(100vh - 4.5rem)`
                            : 'auto'
                    }}
                >
                    {/* The text block is centred vertically next to the carousel */}
                    <div className={`w-full ${shouldStack ? '' : 'md:w-1/2'} px-8 lg:px-10 flex flex-col justify-center`} ref={leftRef} style={{ containerType: 'inline-size' }}>
                            {/* Three-line h1, present in the HTML for search engines; typed letter by letter (CSS, skipped with reduced motion) */}
                            <h1 className="text-[1.7rem] leading-snug lg:text-4xl font-bold flex flex-col gap-4 lg:gap-5" aria-label={titleLines.join(". ")}>
                                {renderTypedLines(titleLines)}
                            </h1>
                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}>
                                <p className="leading-relaxed md:text-lg mt-12 lg:mt-16">{t("hero.text")}</p>
                                <CTA className="mt-8" source="Home - Hero" />
                            </motion.div>
                    </div>

                    <motion.div
                        className={`w-full ${shouldStack ? '' : 'md:w-1/2'} flex justify-center items-center ${shouldStack ? 'mt-12' : ''} px-8 lg:px-10 box-border`}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div
                            className="relative"
                            style={{
                                height: `${imageHeight}px`,
                                width: `${carouselWidth}px`,
                                maxWidth: '100%'
                            }}
                        >
                            {images.map((image, index) => {
                                const state = imageStates[index]
                                return (
                                    <div
                                        key={index}
                                        className="absolute rounded-lg overflow-hidden shadow-2xl transition-transform duration-[500ms] ease-[cubic-bezier(0.45,0,0.55,1)]"
                                        style={{
                                            height: "100%",
                                            width: `${imageWidth}px`,
                                            left: `${index * imageSpacing}px`,
                                            transform: `translateX(${state.translateX}px)`,
                                            zIndex: state.zIndex,
                                        }}
                                    >
                                        <img
                                            src={image.src800}
                                            srcSet={`${image.src400} 400w, ${image.src800} 800w, ${image.src1200} 1200w`}
                                            sizes="(max-width: 767px) 200px, 300px"
                                            alt={carouselAlts[index]}
                                            className="w-full h-full object-cover"
                                            fetchPriority={index === 0 ? "high" : undefined}
                                        />
                                        <div
                                            className="absolute inset-0 bg-black transition-opacity duration-[700ms]"
                                            style={{
                                                opacity: state.isFront ? 0 : 0.5,
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
                    {/* Care cards first (cream), then "my approach" (sage green) to keep the background alternation */}
                    <section className="bg-[var(--color-brand-cream)] text-[var(--color-brand-green)] py-8 flex flex-col items-center">
                        <div className="px-8 lg:px-10 md:max-w-[1000px] w-full">
                            <h2 className="text-[1.7rem] text-center mb-5 lg:text-4xl lg:mb-8">{t("treatments.title")}</h2>
                            <div className="grid grid-cols-1 justify-items-center gap-16 md:grid-cols-3 md:gap-6 lg:gap-8 mt-10">
                                {/* Same order as the home title: post-op first */}
                                <CareCard
                                    src={postOpMarkingPicture800}
                                    srcSet={`${postOpMarkingPicture400} 400w, ${postOpMarkingPicture800} 800w`}
                                    altText={t("careCards.postOp.alt")}
                                    title={t("careCards.postOp.title")}
                                    badges={["medical"]}
                                    text={t("careCards.postOp.text")}
                                    linkTo={`/${i18n.language}${t("routes:postOp")}`}
                                    discoverLabel={t("careCards.discover")}
                                    isMobile={isMobile}
                                    trackingLabel="Kinésithérapie pré et post-opératoire"
                                />
                                <CareCard
                                    src={drainagePicture800}
                                    srcSet={`${drainagePicture400} 400w, ${drainagePicture800} 800w, ${drainagePicture1200} 1200w`}
                                    altText={t("careCards.drainage.alt")}
                                    title={t("careCards.drainage.title")}
                                    badges={["medical", "wellness"]}
                                    text={t("careCards.drainage.text")}
                                    linkTo={`/${i18n.language}${t("routes:treatments")}`}
                                    discoverLabel={t("careCards.discover")}
                                    isMobile={isMobile}
                                    trackingLabel="Drainage lymphatique"
                                />
                                <CareCard
                                    src={images[0].src800}
                                    srcSet={`${images[0].src400} 400w, ${images[0].src800} 800w`}
                                    altText={t("careCards.postPartum.alt")}
                                    title={t("careCards.postPartum.title")}
                                    badges={["medical"]}
                                    text={t("careCards.postPartum.text")}
                                    linkTo={`/${i18n.language}${t("routes:postPartum")}`}
                                    discoverLabel={t("careCards.discover")}
                                    isMobile={isMobile}
                                    trackingLabel="Rééducation abdominale post-partum"
                                />
                            </div>
                        </div>
                        {/* "Coming soon" insert, on a very light gold background */}
                        <div className="px-8 lg:px-10 w-full flex justify-center mt-14">
                            <div className="flex flex-col items-center gap-3 text-center rounded-lg bg-[var(--color-golden-light)]/20 px-6 py-5 max-w-full">
                                <span className="w-fit px-3 py-0.5 text-sm font-bold rounded-full border border-[var(--color-brand-green)]">
                                    {t("careCards.soon.badge")}
                                </span>
                                <p className="leading-relaxed">{t("careCards.soon.text")}</p>
                            </div>
                        </div>
                        <CTA className="mt-10" source="Home - Treatments §" />
                    </section>
                    <section className="py-8 flex flex-col items-center">
                        <div className="px-8 lg:px-10 md:max-w-[1000px]">
                            <h2 className="text-[1.7rem] text-center mb-5 lg:text-4xl lg:mb-8">{t("myApproach.title")}</h2>
                            <div className="md:text-lg flex flex-col gap-4 leading-relaxed">
                                <p>{t("myApproach.p1")}</p>
                                <p>{t("myApproach.p2")}</p>
                            </div>
                        </div>
                        <Link
                            to={`/${i18n.language}${t("routes:about")}`}
                            className="btn-golden block mt-6"
                            onClick={() => trackEvent('CTA', 'Click', 'About - Home - Approach §')}
                        >
                            {t("myApproach.button")}
                        </Link>
                    </section>
                    <section className="bg-[var(--color-brand-cream)] text-[var(--color-brand-green)] py-8 flex flex-col items-center">
                        <div className="px-8 lg:px-10 md:max-w-[1000px] w-full">
                            <h2 className="text-[1.7rem] text-center uppercase mb-5 lg:text-4xl lg:mb-8">{t("process.title")}</h2>
                            {/* Medical path on the left (first on mobile), well-being path on the right */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-10">
                                {(["medical", "wellness"] as const).map((type) => (
                                    <div key={type} className="flex flex-col rounded-lg bg-[var(--color-brand-green)]/10 p-6 lg:p-8">
                                        <CareBadge type={type} />
                                        <h3 className="font-semibold text-xl leading-snug mt-3">{t(`process.${type}.title`)}</h3>
                                        <ol className="list-decimal pl-6 flex flex-col gap-3 mt-4 leading-relaxed">
                                            {(t(`process.${type}.steps`, { returnObjects: true }) as { lead: string; text: string }[]).map((step, index) => (
                                                <li key={index}><strong>{step.lead}</strong>{step.text}</li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <CTA className="mt-10" source="Home - Process §" />
                    </section>
                    <section className="py-8 flex flex-col items-center">
                        <div className="px-8 lg:px-10 md:max-w-[1000px]">
                            <h2 className="text-[1.7rem] text-center uppercase mb-5 lg:text-4xl lg:mb-8">{t("doctors.title")}</h2>
                            <p className="md:text-lg leading-relaxed text-center">{t("doctors.text")}</p>
                        </div>
                        <a
                            href="#contact"
                            className="btn-golden block mt-6"
                            onClick={(event) => {
                                trackEvent('CTA', 'Click', 'Contact - Home - Doctors §')
                                scrollToFooterContact(event)
                            }}
                        >
                            {t("doctors.button")}
                        </a>
                    </section>
            </main >
            <Footer />
        </>
    )
}