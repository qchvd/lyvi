import { Header } from "../header/Header"
import { type FormValues } from "../../types/form"
import ConfirmationTick from "../../assets/logos/ConfirmationTick.svg?react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSidebar } from "../../contexts/SidebarContext"

export function ConfirmationMessageSent(props: { submittedData: FormValues }) {
  const { submittedData } = props
  const { isSidebarOpen } = useSidebar()
  const { t } = useTranslation("confirmationMessageSent")

  // Converts a string to title case while preserving spaces and hyphens
  // Uses join("") to preserve the original separators captured in the split
  function toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(/(\s+|-)/)
      .map(part => {
        if (/\s|-/.test(part)) return part
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join("")
  }

  return (
    <>
      <Header />
      <main inert={isSidebarOpen ? true : undefined} className="relative">
        {/* Decorative background SVG with confirmation tick icon */}
        <ConfirmationTick aria-hidden="true" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 svg-circle z-[-1] fill-[var(--color-brand-green-muted)]"/>
        <div className="flex flex-col justify-center items-center px-4 h-screen w-full">
          <h1 className="text-2xl md:text-4xl lg:text-5xl mb-4 fluid-confirmation-title1 text-center font-light">{t("line1.beforeName")} {toTitleCase(submittedData.firstname)} {t("line1.afterName")}</h1>
          <h2 className="md:text-lg lg:text-2xl mb-12 fluid-confirmation-title2 text-center font-thin">{t("line2")}</h2>
          <Link to="/" className="btn-golden">{t("home")}</Link>
        </div>
      </main>
    </>
  )
}