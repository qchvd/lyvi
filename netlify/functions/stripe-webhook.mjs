// Stripe webhook: called by Stripe after each payment (Stripe dashboard → Developers → Webhooks,
// endpoint https://lyvicare.com/.netlify/functions/stripe-webhook, events "checkout.session.completed"
// and "checkout.session.async_payment_succeeded"). Creates and emails the gift voucher.
// An error answer (500) makes Stripe retry later, for up to 3 days.

import { fulfillVoucher, stripe } from "../lib/giftVoucher.mjs"

const HANDLED_EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded"]

export default async (request) => {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 })

    // The signature proves the call comes from Stripe (checked on the raw body)
    let event
    try {
        event = stripe().webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        console.error("Invalid Stripe signature:", error.message)
        return new Response("Invalid signature", { status: 400 })
    }

    if (HANDLED_EVENTS.includes(event.type)) {
        try {
            const voucher = await fulfillVoucher(event.data.object.id)
            if (voucher) console.log(`Gift voucher ${voucher.code} sent (${voucher.id})`)
        } catch (error) {
            console.error("Gift voucher not sent, Stripe will retry:", error)
            return new Response("Error", { status: 500 })
        }
    }
    return new Response("OK", { status: 200 })
}
