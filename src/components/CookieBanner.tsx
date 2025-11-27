import CookieConsent, { getCookieConsentValue } from "react-cookie-consent"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"

export function CookieBanner() {
    const { i18n, t } = useTranslation("cookies")
    const [isVisible, setIsVisible] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        // Checks first if the user made a choice
        const cookieValue = getCookieConsentValue("lyviCookieConsent")
        
        // If no existing cookie, shows the pop-up after 500ms
        if (!cookieValue) {
            const timer = setTimeout(() => {
                setIsVisible(true)
                setTimeout(() => {
                    setHasAnimated(true)
                }, 600)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            })
        }
    }

    const handleDecline = () => {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            })
        }
    }

    // Doesn't render if not visible
    if (!isVisible) return null

    return (
        <CookieConsent
            location="none"
            buttonText={t("accept")}
            declineButtonText={t("decline")}
            enableDeclineButton
            onAccept={handleAccept}
            onDecline={handleDecline}
            cookieName="lyviCookieConsent"
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
            buttonWrapperClasses="flex gap-3 flex-row-reverse mt-6"
            expires={30}
        >
            <div className="flex flex-col gap-2">
                <h2 className="text-black text-2xl font-extrabold leading-tight">
                    {t("title1")}
                    <br className={i18n.language === "fr" ? "md:hidden" : "hidden"} />
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