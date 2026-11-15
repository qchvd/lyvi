// Gift voucher of a paid order, for the thank-you message of the gift vouchers page:
//   /.netlify/functions/gift-voucher?session_id=cs_…             → { status: "ready" | "pending", email }
//   /.netlify/functions/gift-voucher?session_id=cs_…&download=1  → the PDF
// Only works for a paid Stripe order (the session id is a long random number, impossible to guess).
// "pending": paid, but the webhook has not created the voucher yet (a few seconds): the page asks again.

import { buildVoucherPdf, pdfFileName, readVoucher } from "../lib/giftVoucher.mjs"

const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } })

// "jane.doe@gmail.com" → "j•••@gmail.com"
const maskEmail = (email) => email.replace(/^(.)[^@]*@/, "$1•••@")

export default async (request) => {
    const params = new URL(request.url).searchParams
    const voucher = await readVoucher(params.get("session_id") || "")

    if (!voucher?.id) return json({ status: "unknown" }, 404)
    if (!voucher.code) return json({ status: "pending" })

    if (params.get("download")) {
        return new Response(await buildVoucherPdf(voucher), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${pdfFileName(voucher)}"`,
                "Cache-Control": "no-store",
            },
        })
    }
    return json({ status: "ready", email: maskEmail(voucher.email) })
}
