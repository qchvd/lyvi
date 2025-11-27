import { Header } from "../header/Header"
import { useSidebar } from "../../contexts/SidebarContext"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useWindowWidth } from "../../hooks/useWindowWidth"
import drainagePicture400 from "../../assets/images/optimized/drainagePicture-400w.webp"
import drainagePicture800 from "../../assets/images/optimized/drainagePicture-800w.webp"
import drainagePicture1200 from "../../assets/images/optimized/drainagePicture-1200w.webp"
import remodelagePicture400 from "../../assets/images/optimized/remodelagePicture-400w.webp"
import remodelagePicture800 from "../../assets/images/optimized/remodelagePicture-800w.webp"
import remodelagePicture1200 from "../../assets/images/optimized/remodelagePicture-1200w.webp"
import miracleFacePicture400 from "../../assets/images/optimized/miracleFacePicture-400w.webp"
import miracleFacePicture800 from "../../assets/images/optimized/miracleFacePicture-800w.webp"
import miracleFacePicture1200 from "../../assets/images/optimized/miracleFacePicture-1200w.webp"
import { Footer } from "../footer/Footer"
import { useIsMobile } from "../../hooks/useIsMobile"
import { motion } from "framer-motion"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { CTA } from "../header/CTA"
import { Helmet } from "react-helmet-async"
import { TreatmentCard } from "../home/TreatmentCard"

// Helper function to render animated title with staggered fade-in, supporting line breaks
// Use "|" to insert a line break between words
function renderAnimatedTitle(text: string) {
  const parts = text.split("|")

  return parts.map((part, partIndex) => {
    const letters = part.split("").map((letter, letterIndex) => {
      const globalIndex = parts.slice(0, partIndex).reduce((sum, p) => sum + p.length, 0) + letterIndex

      return (
        <span
          key={`${partIndex}-${letterIndex}`}
          className="inline-block"
          style={{
            animation: `fadeIn 0.3s ease-out ${0.1 + globalIndex * 0.05}s both`
          }}
        >
          {letter}
        </span>
      )
    })

    return (
      <span key={partIndex}>
        {letters}
        {partIndex < parts.length - 1 && <br />}
      </span>
    )
  })
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
    let imageHeight = Math.min(mobileOrPortraitHeight, imageHeightFromWidth)
    let imageWidth = imageHeight / aspectRatio

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
            <main inert={isSidebarOpen ? true : undefined} className="pt-18 min-h-screen overflow-x-hidden">
                <div
                    className={`flex ${shouldStack ? 'flex-col' : 'md:flex-row'} py-8 md:py-10`}
                    style={{
                        height: !shouldStack && window.matchMedia('(orientation: landscape)').matches
                            ? `calc(100vh - 4.5rem)`
                            : 'auto'
                    }}
                >
                    <div className={`w-full ${shouldStack ? '' : 'md:w-1/2'} px-8 lg:px-10`} ref={leftRef} style={{ containerType: 'inline-size' }}>
                        <h1 className="fluid-home-title1 font-extrabold leading-none" aria-label={t("ariaLabels:homeTypeWriterTitle")}>
                            {i18n.language === "fr"
                                ? renderAnimatedTitle("LISSEZ.|SCULPTEZ.|RAYONNEZ.")
                                : i18n.language === "de"
                                ? renderAnimatedTitle("GLÄTTEN.|FORMEN.|STRAHLEN.")
                                : renderAnimatedTitle("SMOOTH.|SCULPT.|GLOW.")
                            }
                        </h1>
                        <motion.p
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="leading-relaxed text-justify md:text-lg" style={{ marginTop: `${Math.max(100 * scale, 60)}px` }}>
                            {t("introText")}
                        </motion.p>
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
                <section className="bg-[var(--color-brand-cream)] text-[var(--color-brand-green)] py-8 flex flex-col items-center">
                    <div className="px-8 lg:px-10 md:max-w-[1000px]">
                        <h2 className="text-[1.7rem] text-center mb-5 lg:text-4xl lg:mb-8">{t("myApproach.title")}</h2>
                        <div className="md:text-lg flex flex-col gap-4 text-justify leading-relaxed">
                            <p>{t("myApproach.p1")}</p>
                            <p>{t("myApproach.p2")}</p>
                            <p>{t("myApproach.p3")}</p>
                            <ul className="list-disc pl-12">
                                <li>{t("myApproach.listItem1")}</li>
                                <li>{t("myApproach.listItem2")}</li>
                                <li>{t("myApproach.listItem3")}</li>
                            </ul>
                            <p>{t("myApproach.p4")}</p>
                        </div>
                    </div>
                    <CTA className="mt-6" source="Home - Approach §" />
                </section>
                <section className="py-8 flex flex-col items-center">
                    <div className="px-8 lg:px-10 md:max-w-[1000px]">
                        <div>
                            <h2 className="text-[1.7rem] text-center mb-5 lg:text-4xl lg:mb-8">{t("treatments.title")}</h2>
                            <p className="md:text-lg text-justify leading-relaxed">
                                {t("treatments.p1")}
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-20 md:flex-row md:items-start md:gap-8 mt-10">
                            <TreatmentCard
                                src400={drainagePicture400}
                                src800={drainagePicture800}
                                src1200={drainagePicture1200}
                                title="Drainage"
                                altText={t("altDrainagePicture")}
                                applications={[t("aesthetic"), t("wellness"), t("maternity"), t("postOp"), t("sportsRecovery")]}
                                applicationsTitle={t("applications")}
                                linkTo={`/${i18n.language}${t("routes:treatments")}`}
                                ariaLabel="Drainage"
                                isMobile={isMobile}
                                trackingLabel="Drainage"
                                showMobileCTA={true}
                                ctaComponent={<CTA className="mt-4 mx-auto md:hidden" source="Home - Treatments § - Drainage Card (mobile only)" />}
                            />
                            <TreatmentCard
                                src400={remodelagePicture400}
                                src800={remodelagePicture800}
                                src1200={remodelagePicture1200}
                                title={t("remodelage")}
                                altText={t("altRemodelagePicture")}
                                applications={[t("aesthetic"), t("maternity"), t("postOp")]}
                                applicationsTitle={t("applications")}
                                linkTo={`/${i18n.language}${t("routes:treatments")}`}
                                ariaLabel={t("remodelage")}
                                isMobile={isMobile}
                                trackingLabel="Remodelage"
                                showMobileCTA={true}
                                ctaComponent={<CTA className="mt-4 mx-auto md:hidden" source="Home - Treatments § - Remodelage Card (mobile only)" />}
                            />
                            <TreatmentCard
                                src400={miracleFacePicture400}
                                src800={miracleFacePicture800}
                                src1200={miracleFacePicture1200}
                                title="Miracle Face"
                                altText={t("altMiracleFacePicture")}
                                applications={[t("aesthetic"), t("wellness"), t("postOp")]}
                                applicationsTitle={t("applications")}
                                linkTo={`/${i18n.language}${t("routes:treatments")}`}
                                ariaLabel="Miracle Face"
                                isMobile={isMobile}
                                trackingLabel="Miracle Face"
                            />
                        </div>
                    </div>
                    <CTA className="mt-6" source="Home - Treatments § - Miracle Face Card" />
                </section>
            </main >
            <Footer />
        </>
    )
}