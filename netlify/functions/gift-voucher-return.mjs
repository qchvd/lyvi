// Where Stripe sends the buyer after paying (redirect set on every Payment Link):
// /.netlify/functions/gift-voucher-return?session_id={CHECKOUT_SESSION_ID}
// Redirects to the gift vouchers page in the buyer's language, which then shows the thank-you message.
// Unknown or unpaid order: plain gift vouchers page.

import { LANGS, PAGE_PATHS, readVoucher, stripe } from "../lib/giftVoucher.mjs"

export default async (request) => {
    const sessionId = new URL(request.url).searchParams.get("session_id") || ""
    const voucher = await readVoucher(sessionId)

    let lang = voucher?.lang
    if (!lang && sessionId.startsWith("cs_")) {
        // Unpaid order: still use its language
        lang = await stripe().checkout.sessions.retrieve(sessionId).then((session) => session.client_reference_id, () => undefined)
    }
    if (!LANGS.includes(lang)) lang = "fr"

    const location = voucher?.id ? `${PAGE_PATHS[lang]}?session_id=${encodeURIComponent(sessionId)}` : PAGE_PATHS[lang]
    return new Response(null, { status: 302, headers: { Location: location, "Cache-Control": "no-store" } })
}
