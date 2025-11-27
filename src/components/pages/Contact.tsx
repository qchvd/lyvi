import { Header } from "../header/Header"
import { useIsMobile } from "../../hooks/useIsMobile"
import * as Yup from "yup"
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik"
import { useTranslation } from "react-i18next"
import { useEffect, useState, Suspense } from "react"
import { LazyConfirmationMessageSent } from "../routes/LazyRoutes"
import { type FormValues } from "../../types/form"
import { useArchScrollEffect } from "../../hooks/useArchScrollEffect"
import contactPicture from "../../assets/images/contactPicture.webp"
import InstagramLogo from "../../assets/logos/InstagramLogo.svg?react"
import DoctolibLogo from "../../assets/logos/DoctolibLogo.svg?react"
import { useSidebar } from "../../contexts/SidebarContext"
import { motion } from "framer-motion"
import { usePreserveScrollOnLanguageChange } from "../../hooks/usePreserveScrollOnLanguageChange"
import { CONTACT_INFO } from "../../constants/contactInfo.tsx"
import { DOCTOLIB_URL, INSTAGRAM_URL, GOOGLE_MAPS_URL } from "../../constants/urls"

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

export function Contact() {
  usePreserveScrollOnLanguageChange()
  const isMobile = useIsMobile()
  const { isSidebarOpen } = useSidebar()
  const { t, i18n } = useTranslation(["contact", "ariaLabels", "footer"])
  const [submitStatus, setSubmitStatus] = useState("")
  const [submittedData, setSubmittedData] = useState<null | FormValues>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    message: ""
  })

  const validationSchema = () => Yup.object({
    firstname: Yup
      .string()
      .min(2, t("validation.firstname.min"))
      .max(50, t("validation.firstname.max"))
      .required(t("validation.required")),
    lastname: Yup
      .string()
      .min(2, t("validation.lastname.min"))
      .max(50, t("validation.lastname.max"))
      .required(t("validation.required")),
    phone: Yup
      .string()
      .min(7, t("validation.phone.min"))
      .max(15, t("validation.phone.max"))
      .matches(/^[+]?[0-9\-]+$/, t('validation.phone.invalid')),
    email: Yup
      .string()
      .email(t("validation.email.invalid"))
      .required(t("validation.required")),
    message: Yup
      .string()
      .required(t("validation.required"))
  })

  // Reset form status when navigating back or clicking contact tab
  useEffect(() => {
    const handlePopState = () => setSubmitStatus("")
    const handleResetContact = () => setSubmitStatus("")

    window.addEventListener("popstate", handlePopState)
    window.addEventListener("resetContact", handleResetContact)

    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("resetContact", handleResetContact)
    }
  }, [])

  // Encode form data for Netlify submission (converts object to URL-encoded string)
  const encode = (data: Record<string, string>) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&")
  }

  // Renders contact image with optional scroll-based arch animation effect
  // Used on mobile (with arch effect) and desktop (static, positioned as fixed sidebar)
  const ImageContent = ({ className = "", withArchEffect = false }) => {
    const { imageRef, getBorderRadius } = useArchScrollEffect()

    if (withArchEffect) {
      return (
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            ref={imageRef}
            src={contactPicture}
            alt={t("altContactPicture")}
            className={`w-full h-full object-cover transition-all duration-300 ease-out ${className}`}
            style={{
              borderRadius: getBorderRadius(),
            }}
            fetchPriority="high"
            loading="eager"
          />
        </div>
      )
    }

    return (
      <img
        src={contactPicture}
        className={className}
        alt={t("altContactPicture")}
        loading="eager"
      />
    )
  }

  const handleSubmit = async (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
    try {
      await fetch(window.location.pathname, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "contact",
          ...values
        })
      })
      setSubmittedData(values)
      resetForm()
      window.history.pushState(
        { showForm: true },
        '',
        window.location.pathname
      )
      setSubmitStatus("success")
    }
    catch (error) {
      setSubmitStatus("error")
    }
  }

  if (submitStatus === "success" && submittedData) {
    return (
      <Suspense>
        <LazyConfirmationMessageSent submittedData={submittedData} />
      </Suspense>
    )
  }

  return (
    <>
      <Header />
      <main inert={isSidebarOpen ? true : undefined} className="pt-18 h-full relative">
        {/* Fixed sidebar with Instagram and Doctolib links */}
        <div className="fixed top-1/2 translate-y-[-50%] right-0 h-25 w-11 z-10 rounded-l-md shadow-lg">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("ariaLabels:instagramLink")}
            className="border-b border-white h-1/2 flex instagram-background justify-center items-center rounded-tl-md cursor-pointer"
          >
            <InstagramLogo className="w-8 fill-white" aria-hidden="true" />
          </a>
          <a
            href={DOCTOLIB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("ariaLabels:doctolibLink")}
            className="h-1/2 border-t border-white flex justify-center items-center rounded-bl-md cursor-pointer"
            style={{ backgroundColor: 'var(--color-doctolib-blue)' }}
          >
            <DoctolibLogo className="w-6 fill-white" aria-hidden="true" />
          </a>
        </div>
        <div className="lg:flex">
          <section className="lg:w-1/2">
            <div className="px-8 md:px-14 lg:px-10" style={{ containerType: 'inline-size' }}>
              <h1 className="font-bold my-2 fluid-contact-title1" aria-label="LET'S TALK">
                {renderAnimatedTitle("LET'S TALK", 4)}
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-8 leading-relaxed">
                  {t("description.beforeEmail")}{" "}
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    <strong>{CONTACT_INFO.email}</strong>
                  </a>{" "}
                  {i18n.language === "de" ? (
                    <>
                      {t("description.betweenEmailPhone")}{" "}
                      {isMobile ? (
                        <a
                          href={`tel:${CONTACT_INFO.phone}`}
                          className="whitespace-nowrap underline"
                        >
                          <strong>{CONTACT_INFO.phoneDisplay}</strong>
                        </a>
                      ) : (
                        <span className="whitespace-nowrap">
                          <strong>{CONTACT_INFO.phoneDisplay}</strong>
                        </span>
                      )}{" "}
                      {t("description.afterPhone")}
                    </>
                  ) : (
                    <>
                      {t("description.beforePhone")}{" "}
                      {isMobile ? (
                        <a
                          href={`tel:${CONTACT_INFO.phone}`}
                          className="font-bold whitespace-nowrap underline"
                        >
                          {CONTACT_INFO.phoneDisplay}
                        </a>
                      ) : (
                        <span className="font-bold whitespace-nowrap">
                          {CONTACT_INFO.phoneDisplay}
                        </span>
                      )}
                      {t("description.afterPhone")}
                    </>
                  )}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="lg:hidden mb-12">
                <ImageContent withArchEffect={true} />
              </div>
              <div className="px-8 md:px-14 lg:px-10">
                {/* Hidden form (honeypot) to prevent spamming - required for Netlify spam protection to work */}
                <form
                  name="contact"
                  method="POST"
                  netlify-honeypot="bot-field"
                  data-netlify="true"
                  hidden
                >
                  <p>
                    <label>
                      Don't fill this out if you're human: <input name="bot-field" type="text" />
                    </label>
                  </p>
                  <p>
                    <label>
                      Firstname: <input type="text" name="firstname" />
                    </label>
                  </p>
                  <p>
                    <label>
                      Lastname: <input type="text" name="lastname" />
                    </label>
                  </p>
                  <p>
                    <label>
                      Phone: <input type="tel" name="phone" autoComplete="off" />
                    </label>
                  </p>
                  <p>
                    <label>
                      Email: <input type="email" name="email" autoComplete="off" />
                    </label>
                  </p>
                  <p>
                    <label>
                      Message: <textarea name="message"></textarea>
                    </label>
                  </p>
                  <p>
                    <button type="submit">Send</button>
                  </p>
                </form>

                <Formik<FormValues>
                  initialValues={{
                    firstname: '',
                    lastname: '',
                    phone: '',
                    email: '',
                    message: ''
                  }}
                  validationSchema={validationSchema()}
                  onSubmit={handleSubmit}
                  validateOnChange={false}
                  validateOnBlur={true}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-3 w-full mb-12">
                      <input type="hidden" name="form-name" value="contact" />

                      {/* First name */}
                      <div>
                        <label htmlFor="firstname" className="block">
                          {t("form.firstname.label")}<span aria-label={t("ariaLabels:form.required")}>*</span>
                        </label>
                        <div className="form-field">
                          <Field
                            type="text"
                            name="firstname"
                            id="firstname"
                            placeholder="Jane"
                            aria-required="true"
                            aria-describedby="firstname-error"
                            autoComplete="given-name"
                            className="w-full pt-2 pb-1"
                          />
                        </div>
                        <div id="firstname-error" className="h-6 pt-1 text-sm font-bold" role="alert">
                          <ErrorMessage name="firstname" />
                        </div>
                      </div>

                      {/* Last name */}
                      <div>
                        <label htmlFor="lastname" className="block">
                          {t("form.lastname.label")}<span aria-label={t("ariaLabels:form.required")}>*</span>
                        </label>
                        <div className="form-field">
                          <Field
                            type="text"
                            name="lastname"
                            id="lastname"
                            placeholder="Doe"
                            aria-required="true"
                            aria-describedby="lastname-error"
                            autoComplete="family-name"
                            className="w-full pt-2 pb-1"
                          />
                        </div>
                        <div id="lastname-error" className="h-6 pt-1 text-sm font-bold" role="alert">
                          <ErrorMessage name="lastname" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block">
                          {t("form.phone.label")}
                        </label>
                        <div className="form-field">
                          <Field
                            type="text"
                            name="phone"
                            id="phone"
                            placeholder="+33 X XX XX XX XX"
                            aria-describedby="phone-error"
                            autoComplete="tel"
                            className="w-full pt-2 pb-1"
                          />
                        </div>
                        <div id="phone-error" className="h-6 pt-1 text-sm font-bold" role="alert">
                          <ErrorMessage name="phone" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block">
                          {t("form.email.label")}<span aria-label={t("ariaLabels:form.required")}>*</span>
                        </label>
                        <div className="form-field">
                          <Field
                            type="email"
                            name="email"
                            id="email"
                            placeholder="jane.doe@gmail.com"
                            aria-required="true"
                            aria-describedby="email-error"
                            autoComplete="email"
                            className="w-full pt-2 pb-1"
                          />
                        </div>
                        <div id="email-error" className="h-6 pt-1 text-sm font-bold" role="alert">
                          <ErrorMessage name="email" />
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="message" className="block">
                          {t("form.message.label")}<span aria-label={t("ariaLabels:form.required")}>*</span>
                        </label>
                        <div className="form-field">
                          <Field
                            as="textarea"
                            name="message"
                            id="message"
                            placeholder={t("form.message.placeholder")}
                            aria-required="true"
                            aria-describedby="message-error"
                            className="w-full h-24 pt-2 pb-1 hide-scrollbar"
                            onWheel={(e: React.WheelEvent<HTMLTextAreaElement>) => {
                              e.stopPropagation()
                            }}
                          />
                        </div>
                        <div id="message-error" className="h-6 pt-1 text-sm font-bold" role="alert">
                          <ErrorMessage name="message" />
                        </div>
                      </div>

                      {/* Submission button  */}
                      <div className="flex flex-col gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          aria-disabled={isSubmitting}
                          className="btn-golden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("form.button")}
                        </button>
                        {submitStatus === 'error' && (
                          <div className="text-red-500 bg-[var(--color-brand-cream)] px-4 w-fit rounded-md">
                            {t("form.errorMessage")}
                          </div>
                        )}
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </motion.div>

            <motion.aside
              className="pl-8 md:pl-14 lg:pl-10 flex flex-col gap-8 pb-12"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="relative">
                <h2 className="mb-1 text-xl"><strong>{t("address.label")}</strong></h2>
                <address className="not-italic leading-6">
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`cursor-pointer ${isMobile ? "underline" : "hover:underline"}`}
                  >
                    {CONTACT_INFO.address.name}<br />
                    {CONTACT_INFO.address.street()}<br />
                    {CONTACT_INFO.address.city}<br />
                    {CONTACT_INFO.address.country}
                  </a>
                </address>
              </div>
            </motion.aside>
          </section>
          <div className="hidden lg:block lg:w-1/2 lg:fixed lg:right-0 lg:top-18 lg:bottom-0">
            <ImageContent className="w-full h-full object-cover" />
          </div>
        </div >
      </main >
    </>
  )
}