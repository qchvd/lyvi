import CookieConsent, { getCookieConsentValue } from "react-cookie-consent"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { updateConsent } from "../utils/analytics"

// Also read in index.html (Google consent mode). Renamed from "lyviCookieConsent" when Google Ads was added
// to the banner text: consents given before did not cover ads, so everyone is asked again once.
const CONSENT_COOKIE = "lyviCookieConsent2"

export function CookieBanner() {
    const { t } = useTranslation("cookies")
    const [isVisible, setIsVisible] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        // Checks first if the user made a choice
        const cookieValue = getCookieConsentValue(CONSENT_COOKIE)
        
        // If no existing cookie, shows the pop-up after 1500ms
        if (!cookieValue) {
            const timer = setTimeout(() => {
                setIsVisible(true)
                setTimeout(() => {
                    setHasAnimated(true)
                }, 600)
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => updateConsent(true)
    const handleDecline = () => updateConsent(false)

    // Doesn't render if not visible
    if (!isVisible) return null

    return (
        <CookieConsent
            location="none"
            buttonText={t("accept")}
            declineButtonText={t("decline")}
            enableDeclineButton
            // Without these, the library names the buttons "Accept cookies" / "Decline cookies" in English for screen readers
            ariaAcceptLabel={t("accept")}
            ariaDeclineLabel={t("decline")}
            // "Accept" comes first in the HTML, so the Tab order matches the display order (Accept, then Decline)
            flipButtons
            onAccept={handleAccept}
            onDecline={handleDecline}
            cookieName={CONSENT_COOKIE}
            containerClasses={`cookie-banner-container ${hasAnimated ? 'no-animation' : ''}`}
            style={{
                background: "#FAF2E8",
                padding: "18px",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                width: "320px",
                position: "fixed",
                bottom: "30px",
                left: "50%",
                display: "flex",
                flexDirection: "column",
            }}
            contentStyle={{
                flex: "none",
                margin: 0,
                padding: 0
            }}
            buttonStyle={{
                background: "#000",
                color: "#fff",
                padding: "9px 18px",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                margin: "0px",
            }}
            declineButtonStyle={{
                background: "#000",
                color: "#fff",
                padding: "9px 18px",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                margin: "0px",
            }}
            buttonWrapperClasses="flex gap-3 mt-6"
            expires={30}
        >
            <div className="flex flex-col gap-2">
                <h2 className="text-black text-2xl font-extrabold leading-tight">
                    {t("title1")}
                    <br className="md:hidden" />
                    {' '}
                    {t("title2")}
                </h2>
                <p className="text-black leading-snug text-sm">
                    {t("message")}
                </p>
            </div>
        </CookieConsent>
    )
}