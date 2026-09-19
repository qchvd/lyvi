import { type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "../header/Header"
import { Footer } from "../footer/Footer"
import { motion } from "framer-motion"
import { useSidebar } from "../../contexts/SidebarContext"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { CTA } from "../header/CTA"

// Helper function to render animated title letters with staggered fade-in
function renderAnimatedTitle(text: string) {
    return text.split("").map((letter, index) => (
        <span
            key={index}
            className="inline-block"
            style={{ animation: `fadeIn 0.3s ease-out ${0.1 + index * 0.05}s both` }}
        >
            {letter}
        </span>
    ))
}

// Visual separator between content sections
function Divider() {
    return <hr className="w-full border-t border-current mt-14" />
}

// A top-level content section anchored by an h3, exposed to assistive tech via aria-labelledby
function PostOpSection({ id, title, contentClassName = "mt-4", children }: { id: string; title: string; contentClassName?: string; children: ReactNode }) {
    return (
        <section aria-labelledby={id}>
            <h3 id={id} className="text-xl font-bold mt-8">{title}</h3>
            <div className={`flex flex-col gap-4 leading-relaxed ${contentClassName}`}>
                {children}
            </div>
        </section>
    )
}

// A nested subsection anchored by an h4, used for the "after op" timeline sub-groups
function PostOpSubSection({ title, topClassName = "mt-8", children }: { title: string; topClassName?: string; children: ReactNode }) {
    return (
        <>
            <h4 className={`text-lg font-bold ${topClassName}`}>{title}</h4>
            <div className="flex flex-col gap-4 mt-2 leading-relaxed">
                {children}
            </div>
        </>
    )
}

export function PostOp() {
    usePreserveScrollOnLanguageChange()
    const { isSidebarOpen } = useSidebar()
    const { t } = useTranslation(["postOp", "routes", "ariaLabels"])

    const faqItems = [1, 2, 3, 4, 5].map((n) => ({
        question: t(`faq.q${n}`),
        answer: t(`faq.a${n}`)
    }))

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main inert={isSidebarOpen ? true : undefined} className="pt-18 flex-1 px-8 lg:px-10" style={{ containerType: "inline-size" }}>
                    <h1 className="font-bold my-2 fluid-post-op-title1" aria-label={t("ariaLabels:postOpTypeWriterTitle")}>
                        {renderAnimatedTitle("POST-OP")}
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl flex flex-col"
                    >
                        <section aria-labelledby="postop-intro-title">
                            <h2 id="postop-intro-title" className="text-2xl font-bold">{t("mainTitle")}</h2>
                            <div className="flex flex-col gap-4 mt-6 leading-relaxed">
                                <p>{t("intro.p1")}</p>
                                <p>{t("intro.p2")}</p>
                                <p>{t("intro.p3")}</p>
                                <CTA className="mt-3" source="Post-op - Intro §" />
                            </div>
                        </section>

                        <Divider />
                        <PostOpSection id="postop-before-op-title" title={t("beforeOpMainTitle")}>
                            <p>{t("beforeOp.p1")}</p>
                            <p>{t("beforeOp.p2")}</p>
                            <p>
                                <strong>{t("eachProtocoleIsDifferent")}</strong>
                                {t("beforeOp.p3s1")}
                                <strong>{t("reviewSession")}</strong>
                                {t("beforeOp.p3s2")}
                                <strong>{t("sixWeeks")}</strong>
                                {t("beforeOp.p3s3")}
                            </p>
                            <ul className="list-disc pl-8">
                                <li>{t("beforeOp.listItem1")}</li>
                                <li>{t("beforeOp.listItem2")}</li>
                                <li>{t("beforeOp.listItem3")}</li>
                            </ul>
                            <p>{t("beforeOp.p4")}</p>
                        </PostOpSection>

                        <Divider />
                        <section aria-labelledby="postop-after-op-title">
                            <h3 id="postop-after-op-title" className="text-xl font-bold mt-8">{t("afterOpMainTitle")}</h3>

                            <PostOpSubSection title={t("afterOpSubTitle1")} topClassName="mt-4">
                                <p>{t("afterOp.p1")}</p>
                                <ul className="list-disc pl-8">
                                    <li>{t("afterOp.listItem1")}</li>
                                    <li>{t("afterOp.listItem2")}</li>
                                </ul>
                            </PostOpSubSection>

                            <PostOpSubSection title={t("afterOpSubTitle2")}>
                                <p>
                                    {t("afterOp.p2s1")}
                                    <strong>{t("j3j15")}</strong>
                                    {t("afterOp.p2s2")}
                                </p>
                            </PostOpSubSection>

                            <PostOpSubSection title={t("afterOpSubTitle3")}>
                                <p>{t("afterOp.p3")}</p>
                                <ul className="list-disc pl-8">
                                    <li>{t("afterOp.listItem3")}</li>
                                    <li>{t("afterOp.listItem4")}</li>
                                    <li>{t("afterOp.listItem5")}</li>
                                    <li>{t("afterOp.listItem6")}</li>
                                </ul>
                            </PostOpSubSection>

                            <PostOpSubSection title={t("afterOpSubTitle4")}>
                                <p>{t("afterOp.p5")}</p>
                            </PostOpSubSection>
                        </section>

                        <Divider />
                        <PostOpSection id="postop-interventions-title" title={t("interventionsMainTitle")}>
                            <p>{t("interventions.p1")}</p>
                            <ul className="list-disc pl-8">
                                <li>{t("interventions.listItem1")}</li>
                                <li>{t("interventions.listItem2")}</li>
                                <li>{t("interventions.listItem3")}</li>
                                <li>{t("interventions.listItem4")}</li>
                                <li>{t("interventions.listItem5")}</li>
                            </ul>
                            <p>{t("interventions.p2")}</p>
                        </PostOpSection>

                        <Divider />
                        <PostOpSection id="postop-lipedema-title" title={t("lipedemaMainTitle")}>
                            <p>{t("lipedema.p1")}</p>
                            <p>{t("lipedema.p2")}</p>
                        </PostOpSection>

                        <Divider />
                        <section aria-labelledby="postop-faq-title">
                            <h3 id="postop-faq-title" className="text-xl font-bold mt-8">{t("faqMainTitle")}</h3>
                            <div className="flex flex-col gap-8">
                                {faqItems.map(({ question, answer }, index) => (
                                    <div key={index} className={`flex flex-col ${index === 0 ? "mt-4" : ""}`}>
                                        <h4 className="text-lg font-bold">{question}</h4>
                                        <p className="leading-relaxed">{answer}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <Divider />
                        <PostOpSection id="postop-ready-title" title={t("readyToStartMainTitle")} contentClassName="">
                            <p className="mt-4">{t("readyToStart.p1")}</p>
                            <CTA className="mt-3" source="Post-op - Ready to start §" />
                        </PostOpSection>
                    </motion.div>
                </main>
                <Footer />
            </div>
        </>
    )
}
