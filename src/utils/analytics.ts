// Analytics go through Google Tag Manager only (container GTM-5PHH5488, loaded in index.html).
// Page views: sent by the GA4 tag in GTM (page load + browser history changes, GA4 "enhanced measurement").
// Clicks: pushed to the dataLayer as a "lyvi_event" event; a GA4 event tag in GTM forwards them to Google Analytics.
// Consent: "default" is set in index.html before GTM, "update" by the cookie banner.

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export const trackEvent = (category: string, action: string, label?: string) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: "lyvi_event",
    event_category: category,
    event_action: action,
    event_label: label,
  })
}

// Accepting the banner covers audience measurement and Google Ads (conversions): both are granted or denied together
export const updateConsent = (granted: boolean) => {
  const value = granted ? "granted" : "denied"
  window.gtag?.("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  })
}
