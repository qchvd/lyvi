import { useTranslation } from "react-i18next"
import { Header } from "../header/Header"
import { useState } from "react"
import ClosedEye from "../../assets/logos/closedEye.svg?react"
import OpenedEye from "../../assets/logos/openedEye.svg?react"
import { useIsMobile } from "../../hooks/useIsMobile"
import { Link } from "react-router-dom"
import { useSidebar } from "../../contexts/SidebarContext"
import { Footer } from "../footer/Footer"
import { motion } from "framer-motion"
import { trackEvent } from "../../utils/analytics"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"

// Helper function to render animated title with staggered fade-in, supporting line breaks and spaces
// Use "|" to insert a line break, and spaceAfterIndices array for spaces after specific character indices
function renderAnimatedTitle(text: string, spaceAfterIndices: number[] = [], lang: string) {
  const parts = text.split('|')

  return parts.map((part, partIndex) => {
    const letters = part.split("").map((letter, letterIndex) => {
      const globalIndex = parts.slice(0, partIndex).reduce((sum, p) => sum + p.length, 0) + letterIndex
      const hasSpace = spaceAfterIndices.includes(globalIndex)

      return (
        <span
          key={`${lang}-${partIndex}-${letterIndex}`}
          className="inline-block"
          style={{
            animation: `fadeIn 0.3s ease-out ${0.1 + globalIndex * 0.05}s both`,
            marginLeft: hasSpace ? '1rem' : undefined
          }}
        >
          {letter}
        </span>
      )
    })

    return (
      <span key={`${lang}-${partIndex}`}>
        {letters}
        {partIndex < parts.length - 1 && <br />}
      </span>
    )
  })
}

export function FAQ() {
    usePreserveScrollOnLanguageChange()
    const isMobile = useIsMobile()
    const { isSidebarOpen } = useSidebar()
    const { i18n, t } = useTranslation(["FAQ", "routes", "ariaLabels"])
    const [openItems, setOpenItems] = useState(new Set())

    const faqData = [
        {
            id: 1,
            question: t("faq.q1.question"),
            answer: t("faq.q1.answer")
        },
        {
            id: 2,
            question: t("faq.q2.question"),
            answer: t("faq.q2.answer")
        },
        {
            id: 3,
            question: t("faq.q3.question"),
            answer: t("faq.q3.answer")
        },
        {
            id: 4,
            question: t("faq.q4.question"),
            answer: t("faq.q4.answer")
        },
        {
            id: 5,
            question: t("faq.q5.question"),
            answer: t("faq.q5.answer")
        },
        {
            id: 6,
            question: t("faq.q6.question"),
            answer: t("faq.q6.answer")
        },
        {
            id: 7,
            question: t("faq.q7.question"),
            answer: t("faq.q7.answer")
        },
        {
            id: 8,
            question: t("faq.q8.question"),
            answer: t("faq.q8.answer")
        },
        {
            id: 9,
            question: t("faq.q9.question"),
            answer: t("faq.q9.answer")
        },
        {
            id: 10,
            question: t("faq.q10.question"),
            answer: t("faq.q10.answer")
        },
        {
            id: 11,
            question: t("faq.q11.question"),
            answer: t("faq.q11.answer")
        },
        {
            id: 12,
            question: t("faq.q12.question"),
            answer: t("faq.q12.answer")
        },
        {
            id: 13,
            question: t("faq.q13.question"),
            answer: t("faq.q13.answer")
        },
    ]

    // Toggles FAQ item open/closed - only one item can be open at a time (closes all others)
    const toggleItem = (id: number) => {
        setOpenItems(prev => {
            if (prev.has(id)) {
                return new Set()
            }
            return new Set([id])
        })
    }

    const handleMouseEnter = (id: number) => {
        setOpenItems(new Set([id]))
    }

    const handleMouseLeave = () => {
        setOpenItems(new Set())
    }

    // Only handle clicks on mobile devices (desktop uses hover)
    const handleClick = (id: number) => {
        if (isMobile) {
            toggleItem(id)
        }
    }

    // Formats answer text by splitting paragraphs and handling bullet points alignment
    const formatAnswer = (answer: string) => {
        const paragraphs = answer.split('\n\n')

        return paragraphs.map((paragraph, index) => {
            const hasBullet = paragraph.trim().startsWith("•")
            return (
                <p
                    key={index}
                    className={`${hasBullet ? "text-left" : "text-justify"} ${index > 0 ? "mt-4" : ""} whitespace-pre-line`}
                >
                    {paragraph}
                </p>
            )
        })
    }

    // Contact CTA button with analytics tracking (used in both desktop and mobile layouts)
    const ContactButton = ({ source }: { source: string }) => (
        <Link
            to={`/${i18n.language}${t("routes:contact")}`}
            className="btn-golden"
            onClick={() => trackEvent('CTA', 'Click', `Contact - FAQ ${source}`)}
        >
            {t("contactMe")}
        </Link>
    )

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main inert={isSidebarOpen ? true : undefined} className="pt-18 flex-1 lg:flex">
                    <div className="lg:w-1/2">
                        <div className="px-8 lg:px-10" style={{ containerType: 'inline-size' }}>
                            <h1 className="font-bold mt-5 mb-2 fluid-faq-title1" aria-label={t("ariaLabels:faqTypeWriterTitle")}>
                                {i18n.language === "fr"
                                    ? renderAnimatedTitle("FOIRE|AUX QUESTIONS", [9], i18n.language)
                                    : renderAnimatedTitle("FREQUENTLY|ASKED QUESTIONS", [16], i18n.language)
                                }
                            </h1>

                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                exit={{ opacity: 0 }}
                            >
                                <p className="lg:mt-7 leading-relaxed text-justify">
                                    {t("description.line1")}
                                </p>
                                <div className="hidden lg:mt-6 lg:flex lg:flex-col lg:gap-4">
                                    <p className="leading-relaxed text-justify">
                                        {t("description.line2")}
                                    </p>
                                    <ContactButton source="desktop" />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="mb-9 mt-2 lg:mt-0 lg:w-1/2 px-8 lg:px-10 lg:flex lg:flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            exit={{ opacity: 0 }}
                        >
                            {faqData.map((item) => (
                                <div
                                    key={item.id}
                                    className="border-b-1"
                                    onMouseEnter={() => !isMobile && handleMouseEnter(item.id)}
                                    onMouseLeave={() => !isMobile && handleMouseLeave()}
                                >
                                    <h2>
                                        <button
                                            type="button"
                                            aria-expanded={openItems.has(item.id)}
                                            aria-controls={`sect${item.id}`}
                                            id={`accordion${item.id}id`}
                                            className="w-full flex items-center justify-between py-6 lg:p-6 text-left focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2"
                                            onClick={() => handleClick(item.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    toggleItem(item.id)
                                                }
                                            }}
                                        >
                                            <span className="font-semibold flex-1 pr-4">
                                                {item.question}
                                            </span>

                                            <div className="relative w-5 h-7 flex-shrink-0">
                                                <ClosedEye className={`absolute top-[6px] w-5 h-5 transition-opacity duration-500 ${openItems.has(item.id) ? "opacity-0" : "opacity-100"}`} style={{ fill: 'var(--color-brand-cream)' }} />
                                                <OpenedEye className={`absolute inset-0 w-5 h-5 transition-opacity duration-500 ${openItems.has(item.id) ? "opacity-100" : "opacity-0"}`} style={{ fill: 'var(--color-brand-cream)' }} />
                                            </div>
                                        </button>
                                    </h2>

                                    <div
                                        id={`sect${item.id}`}
                                        role="region"
                                        aria-labelledby={`accordion${item.id}id`}
                                        className={`overflow-hidden ease-in-out ${openItems.has(item.id)
                                            ? 'max-h-[1000px] transition-all duration-500'
                                            : 'max-h-0 transition-all duration-500'
                                            }`}
                                    >
                                        <div className="pb-6 lg:px-6 leading-relaxed text-justify">
                                            {formatAnswer(item.answer)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-12 flex flex-col gap-4 lg:hidden">
                                <p className="leading-relaxed text-justify">
                                    {t("description.line2")}
                                </p>
                                <ContactButton source="mobile" />
                            </div>
                        </motion.div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}