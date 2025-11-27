import { Header } from "../header/Header"
import { useSidebar } from "../../contexts/SidebarContext"
import { useTranslation } from "react-i18next"
import { Footer } from "../footer/Footer"
import { motion } from "framer-motion"
import { useEffect, useState, type ReactNode } from "react"
import Heart from "../../assets/logos/heart.svg?react"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { Helmet } from "react-helmet-async"

// Helper function to render animated title letters with staggered fade-in
function renderAnimatedTitle(text: string, spaceAfterIndex?: number) {
  return text.split('').map((letter, index) => (
    <span
      key={index}
      className="inline-block"
      style={{
        animation: `fadeIn 0.3s ease-out ${0.1 + index * 0.05}s both`,
        marginLeft: spaceAfterIndex !== undefined && index === spaceAfterIndex + 1 ? '1rem' : undefined
      }}
    >
      {letter}
    </span>
  ))
}

// Configuration for responsive image breakpoints
type ImageVariant = 'square' | '1024x2218' | '1200x1800'

interface ImageConfig {
  variant: ImageVariant
  widths: number[]
  sizes: string
}

const RESPONSIVE_IMAGE_CONFIGS: Record<string, ImageConfig> = {
  mobile: {
    variant: 'square',
    widths: [400, 800],
    sizes: '725px'
  },
  tablet: {
    variant: '1024x2218',
    widths: [400, 800],
    sizes: '385px'
  },
  desktop: {
    variant: '1200x1800',
    widths: [400, 800],
    sizes: '471px'
  },
  wide: {
    variant: 'square',
    widths: [400, 800, 1200],
    sizes: '813px'
  }
}

function getImagePath(baseName: string, variant: ImageVariant, width: number): string {
  return `/images/optimized/about/${baseName}-${variant}-${width}w.webp`
}

function buildSrcSet(baseName: string, variant: ImageVariant, widths: number[]): string {
  return widths.map(w => `${getImagePath(baseName, variant, w)} ${w}w`).join(', ')
}

// Chooses the right image format depending on the screen width to save resources
function useResponsiveImage(baseImageName: string): { src: string; srcSet: string; sizes: string } {
  const [imageData, setImageData] = useState<{ src: string; srcSet: string; sizes: string }>(() => {
    const config = RESPONSIVE_IMAGE_CONFIGS.mobile
    return {
      src: getImagePath(baseImageName, config.variant, 800),
      srcSet: buildSrcSet(baseImageName, config.variant, config.widths),
      sizes: config.sizes
    }
  })

  useEffect(() => {
    const updateImage = () => {
      const width = window.innerWidth
      let config: ImageConfig

      // Mobile (<768px) and very wide screens (>1200px) use square format
      // Wide screens get higher resolution images
      if (width < 768 || width > 1200) {
        config = width < 768 ? RESPONSIVE_IMAGE_CONFIGS.mobile : RESPONSIVE_IMAGE_CONFIGS.wide
      } else if (width >= 768 && width < 1024) {
        config = RESPONSIVE_IMAGE_CONFIGS.tablet
      } else {
        config = RESPONSIVE_IMAGE_CONFIGS.desktop
      }

      setImageData({
        src: getImagePath(baseImageName, config.variant, config.widths[config.widths.length - 1]),
        srcSet: buildSrcSet(baseImageName, config.variant, config.widths),
        sizes: config.sizes
      })
    }

    updateImage()
    window.addEventListener("resize", updateImage)
    return () => window.removeEventListener("resize", updateImage)
  }, [baseImageName])

  return imageData
}

interface ResponsiveImageProps {
  baseName: string
  alt: string
  className?: string
  fetchPriority?: "high" | "low" | "auto"
}

function ResponsiveImage({ baseName, alt, className, fetchPriority }: ResponsiveImageProps) {
  const { src, srcSet, sizes } = useResponsiveImage(baseName)

  return (
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={fetchPriority === "high" ? "eager" : "lazy"}
      fetchPriority={fetchPriority}
    />
  )
}

interface StorySectionProps {
  imageName: string
  imageAlt: string
  children: ReactNode
  reverse?: boolean
  isFirst?: boolean
  isLast?: boolean
  background?: "green" | "white"
  imagePriority?: "high" | "low" | "auto"
}

function StorySection({ imageName, imageAlt, children, reverse = false, isFirst = false, isLast = false, background = "green", imagePriority = "auto" }: StorySectionProps) {
  // Returns appropriate padding classes based on section position (first/last sections have asymmetric padding)
  const getPaddingClasses = () => {
    if (isFirst) {
      return "pb-10 lg:pb-14"
    }
    if (isLast) {
      return "pt-10 lg:pt-14 lg:pb-12"
    }
    return "py-10 lg:py-14"
  }
  return (
    <section className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center px-8 lg:px-10
      ${getPaddingClasses()}
      ${background === "white" ? "bg-[var(--color-brand-cream)] text-[var(--color-brand-green)]" : "bg-[var(--color-brand-green)] text-[var(--color-brand-cream)]"}
    `}>
      <div className={`${reverse ? "md:order-2" : "md:order-1"} -mx-8 md:mx-0`}>
        <ResponsiveImage
          baseName={imageName}
          alt={imageAlt}
          className="w-full h-auto object-cover"
          fetchPriority={imagePriority}
        />
      </div>

      <div className={`${reverse ? 'md:order-1' : 'md:order-2'} text-justify md:text-center md:sticky md:top-32 md:self-start`}>
        {children}
      </div>
    </section>
  )
}

// Section content components
function IntroductionContent({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="flex flex-col leading-relaxed">
      <h2 className="text-[1.7rem] mb-5 lg:text-4xl lg:mb-8 text-center">
        {t("hello")} <span className="bg-[var(--color-brand-dark-green)] px-2 py-1 rounded-2xl">Anaïs</span>
      </h2>
      <p className="mb-6">{t("introductionText.p1")}</p>
      <p className="mb-6">{t("introductionText.p2")}</p>
      <p className="mb-6">{t("introductionText.p3")}</p>
      <p className="mb-6">{t("introductionText.p4")}</p>
      <p>{t("introductionText.pilars")}</p>
    </div>
  )
}

function ObjectivesContent({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="flex flex-col gap-6 leading-relaxed">
      <h3 className="text-2xl text-center">{t("objectivesText.title")}</h3>
      <p>{t("objectivesText.p1")}</p>
      <p>{t("objectivesText.p2")}</p>
      <p>{t("objectivesText.p3")}</p>
    </div>
  )
}

function YouMatterContent({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="flex flex-col gap-6 leading-relaxed">
      <h3 className="text-2xl text-center">{t("youMatterText.title")}</h3>
      <p>{t("youMatterText.p1")}</p>
      <p>{t("youMatterText.p2")}</p>
      <p>{t("youMatterText.p3")}</p>
      <p>{t("youMatterText.p4")}</p>
    </div>
  )
}

function PhysioContent({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="flex flex-col gap-6 leading-relaxed">
      <h3 className="text-2xl text-center">{t("physioText.title")}</h3>
      <p>{t("physioText.p1")}</p>
      <p>{t("physioText.p2")}</p>
      <p>{t("physioText.p3")}</p>
      <p>{t("physioText.p4")}</p>
    </div>
  )
}

function LikeMeContent({ t, i18n }: { t: ReturnType<typeof useTranslation>["t"]; i18n: ReturnType<typeof useTranslation>["i18n"] }) {
  return (
    <div className="flex flex-col gap-6 leading-relaxed">
      <h3 className="text-2xl text-center">{t("likeMeText.title")}</h3>
      <p>{t("likeMeText.p1")}</p>
      <p>
        {t("likeMeText.p2BeforeLiv")} <em>{t("likeMeText.liv")}</em>
        {t("likeMeText.p2AfterLiv")}
      </p>
      <p>{t("likeMeText.p3")}</p>
      <p>
        {t("likeMeText.p4")}{" "}
        <em className={i18n.language === "de" ? "not-italic" : ""} lang={i18n.language !== "de" ? "de" : undefined}>
          Viel Spaß!
        </em>
      </p>
      <p className="flex justify-center items-baseline gap-1">
        <Heart className="w-3 h-3 shrink-0 fill-[var(--color-brand-cream)]" aria-label={t("heart")} />
        <span>Anaïs</span>
      </p>
    </div>
  )
}

export function About() {
  usePreserveScrollOnLanguageChange()
  const { isSidebarOpen } = useSidebar()
  const { i18n, t } = useTranslation(["about", "footer", "ariaLabels"])

  // Configuration of all sections with their properties
  const sections = [
    {
      id: 'introduction',
      imageName: 'portraitIntroduction',
      imageAlt: t("footer:altAnaïsPortrait"),
      background: 'green' as const,
      reverse: false,
      isFirst: true,
      imagePriority: 'high' as const,
      content: <IntroductionContent t={t} />
    },
    {
      id: 'objectives',
      imageName: 'portraitObjectives',
      imageAlt: t("altObjectivesPicture"),
      background: 'white' as const,
      reverse: true,
      content: <ObjectivesContent t={t} />
    },
    {
      id: 'youMatter',
      imageName: 'portraitYouMatter',
      imageAlt: t("altYouMatterPicture"),
      background: 'white' as const,
      reverse: false,
      content: <YouMatterContent t={t} />
    },
    {
      id: 'physio',
      imageName: 'portraitPhysio',
      imageAlt: t("altPhysioPicture"),
      background: 'white' as const,
      reverse: true,
      content: <PhysioContent t={t} />
    },
    {
      id: 'likeMe',
      imageName: 'portraitLikeMe',
      imageAlt: t("altLikeMePicture"),
      background: 'green' as const,
      reverse: false,
      isLast: true,
      content: <LikeMeContent t={t} i18n={i18n} />
    }
  ]

  return (
    <>
      <Helmet>
        {/* Preload LCP picture */}
        <link
          rel="preload"
          as="image"
          href="/images/optimized/about/portraitIntroduction-square-800w.webp"
          imageSrcSet="
            /images/optimized/about/portraitIntroduction-square-400w.webp 400w,
            /images/optimized/about/portraitIntroduction-square-800w.webp 800w,
            /images/optimized/about/portraitIntroduction-square-1200w.webp 1200w
          "
          imageSizes="725px"
          fetchPriority="high"
        />
      </Helmet>
      <Header />
      {/* containerType: 'inline-size' enables container queries for responsive fluid typography */}
      <main inert={isSidebarOpen ? true : undefined} className="pt-18 min-h-screen" style={{ containerType: 'inline-size' }}>
        {/* Animated title with staggered fade-in effect for each letter */}
        <h1 className="font-bold my-2 fluid-about-me-title1 px-8 lg:px-10" aria-label={t("ariaLabels:aboutTypeWriterTitle")}>
          {(() => {
            const titleConfig = {
              fr: { text: "APROPOS", spaceAfter: 0 as number | undefined },
              de: { text: "ÜBERMICH", spaceAfter: 3 as number | undefined },
              en: { text: "ABOUT", spaceAfter: undefined as number | undefined }
            } as const

            const config = titleConfig[i18n.language as keyof typeof titleConfig] || titleConfig.en
            return renderAnimatedTitle(config.text, config.spaceAfter)
          })()}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {sections.map((section) => (
            <StorySection
              key={section.id}
              imageName={section.imageName}
              imageAlt={section.imageAlt}
              background={section.background}
              reverse={section.reverse}
              isFirst={section.isFirst}
              isLast={section.isLast}
              imagePriority={section.imagePriority}
            >
              {section.content}
            </StorySection>
          ))}
        </motion.div>
      </main>
      <Footer />
    </>
  )
}