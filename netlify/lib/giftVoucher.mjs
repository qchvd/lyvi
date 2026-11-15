// Shared code of the gift voucher Netlify Functions (netlify/functions/gift-voucher*.mjs and stripe-webhook.mjs).
// Payment is handled by Stripe Payment Links (created by scripts/stripe-gift-vouchers.mjs); here we read the paid
// Checkout Session, give the voucher a unique code (stored on the Stripe payment), build the PDF and email it.
//
// Environment variables (Netlify → Site configuration → Environment variables):
//   STRIPE_SECRET_KEY      Stripe secret key (sk_test_… while testing, sk_live_… in production)
//   STRIPE_WEBHOOK_SECRET  signing secret of the Stripe webhook (whsec_…)
//   SMTP_USER, SMTP_PASS   OVH mailbox used to send the vouchers (contact@lyvicare.com).
//                          If the mailbox password changes, SMTP_PASS must be changed too.

import { randomInt } from "node:crypto"
import Stripe from "stripe"
import nodemailer from "nodemailer"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { PDFDocument, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fr from "../../public/locales/fr/giftVouchers.json" with { type: "json" }
import en from "../../public/locales/en/giftVouchers.json" with { type: "json" }
import de from "../../public/locales/de/giftVouchers.json" with { type: "json" }
import footerFr from "../../src/locales/fr/footer.json" with { type: "json" }
import footerEn from "../../src/locales/en/footer.json" with { type: "json" }
import footerDe from "../../src/locales/de/footer.json" with { type: "json" }
import { CONTACT_INFO } from "../../src/constants/contactInfo.ts"
import { DOCTOLIB_URL } from "../../src/constants/urls.ts"

export const TEXTS = { fr, en, de }
const FOOTER = { fr: footerFr, en: footerEn, de: footerDe }
export const LANGS = ["fr", "en", "de"]
// Gift vouchers page of each language (same as "giftVouchers" in public/locales/*/routes.json)
export const PAGE_PATHS = { fr: "/fr/bons-cadeaux", en: "/en/gift-vouchers", de: "/de/gutscheine" }
// Copy of every voucher email (and sender address)
export const SHOP_EMAIL = "contact@lyvicare.com"

export const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY)

// "{{name}}" placeholders of the translation texts
const fill = (text, values) => text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "")

// Unique voucher code, e.g. "LYVI-7K3P-Q9XM" (no 0/O or 1/I, easy to read out)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const randomBlock = () => Array.from({ length: 4 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("")
const newCode = () => `LYVI-${randomBlock()}-${randomBlock()}`

/**
 * Everything about a voucher, read from its Stripe Checkout Session (+ its payment).
 * Returns null when the session does not exist or is not paid.
 */
export async function readVoucher(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) return null
    let session
    try {
        session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] })
    } catch {
        return null
    }
    if (session.payment_status !== "paid" || !session.payment_intent) return null

    const payment = session.payment_intent
    const field = (key) => session.custom_fields?.find((custom) => custom.key === key)?.text?.value?.trim() || ""
    const lang = LANGS.includes(session.client_reference_id) ? session.client_reference_id : "fr"
    // voucher id set on the Payment Link, e.g. "drainage-5"
    const id = payment.metadata?.voucher_id || ""
    const [care, sessions] = [id.slice(0, id.lastIndexOf("-")), Number(id.slice(id.lastIndexOf("-") + 1))]
    // Valid for one year from the purchase date
    const expires = new Date(session.created * 1000)
    expires.setFullYear(expires.getFullYear() + 1)

    return {
        session,
        payment,
        lang,
        id,
        care,
        sessions,
        beneficiary: field("beneficiaire"),
        email: session.customer_details?.email || "",
        expires,
        code: payment.metadata?.voucher_code || "",
        emailSent: payment.metadata?.voucher_email_sent === "true",
    }
}

// "Drainage lymphatique – Cure de 5 séances"
export function careLabel(voucher, lang = voucher.lang) {
    const texts = TEXTS[lang].card
    const group = { 1: "single", 5: "cure5", 8: "cure8" }[voucher.sessions]
    return `${texts.cares[voucher.care] ?? voucher.care} – ${texts.groups[group] ?? ""}`
}

export function formatDate(date, lang) {
    return new Intl.DateTimeFormat({ fr: "fr-FR", en: "en-GB", de: "de-DE" }[lang], { day: "numeric", month: "long", year: "numeric" }).format(date)
}

/**
 * Gives the voucher its code (once) and emails it (once). Safe to call again for the same payment:
 * Stripe may send the same webhook several times.
 */
export async function fulfillVoucher(sessionId) {
    const voucher = await readVoucher(sessionId)
    // Not paid, or a payment that is not a gift voucher (no voucher id on its Payment Link)
    if (!voucher || !voucher.id) return null

    // 1. Code saved on the Stripe payment first, so a retry never creates a second code
    if (!voucher.code) {
        voucher.code = newCode()
        await stripe().paymentIntents.update(voucher.payment.id, {
            description: `Bon cadeau ${voucher.code} – ${careLabel(voucher, "fr")} – pour ${voucher.beneficiary}`,
            metadata: {
                voucher_code: voucher.code,
                voucher_beneficiary: voucher.beneficiary.slice(0, 500),
                voucher_expires: voucher.expires.toISOString().slice(0, 10),
                voucher_email_sent: "false",
            },
        })
    }

    // 2. Email, then marked as sent (a failed sending is retried by Stripe with the same code)
    if (!voucher.emailSent) {
        await sendVoucherEmail(voucher)
        await stripe().paymentIntents.update(voucher.payment.id, { metadata: { voucher_email_sent: "true" } })
        voucher.emailSent = true
    }
    return voucher
}

// ---------- PDF ----------

// Voucher designed by Anaïs in Canva, exported as PDF (one per language): the page is kept as is (vector, no
// quality loss) and the values are written on its dotted lines with Montserrat, the font of the printed labels.
// These files are added to the functions by "included_files" in netlify.toml.
const ASSETS = "netlify/lib"
const FONT_FILE = "fonts/Montserrat-Medium.ttf"
const INK = rgb(0x1f / 255, 0x1f / 255, 0x1f / 255)

// Positions measured on the templates rendered 1748 px wide, from the top left corner: start of the dots, end of the
// dots, baseline of the printed label (the value is written on the same baseline). To measure again if a template changes.
const TEMPLATE_WIDTH = 1748
const BASELINES = { care: 655, beneficiary: 766, expires: 876, code: 988 }
const DOTS = {
    fr: { care: [567, 1436], beneficiary: [390, 1436], expires: [649, 1432], code: [411, 1436] },
    en: { care: [468, 1433], beneficiary: [350, 1433], expires: [508, 1435], code: [411, 1436] },
    de: { care: [481, 1433], beneficiary: [350, 1433], expires: [481, 1433], code: [390, 1436] },
}
// Text size in the same pixels (14 pt on an A5 page), never smaller than MIN_SIZE when shrunk to fit its line
const TEXT_SIZE = 41
const MIN_SIZE = 24

// Finds an asset both locally (repository root) and in the deployed function (where the working directory may differ)
function readAsset(path) {
    const here = dirname(fileURLToPath(import.meta.url))
    const roots = [process.cwd(), process.env.LAMBDA_TASK_ROOT, here, join(here, ".."), join(here, "..", ".."), join(here, "..", "..", "..")]
    for (const root of roots.filter(Boolean)) {
        const file = join(root, ASSETS, path)
        if (existsSync(file)) return readFileSync(file)
    }
    throw new Error(`Gift voucher asset not found: ${path}`)
}

export async function buildVoucherPdf(voucher) {
    const texts = TEXTS[voucher.lang].voucher
    const templateLang = DOTS[voucher.lang] ? voucher.lang : "fr"
    const pdf = await PDFDocument.load(readAsset(`voucher-templates/${templateLang}.pdf`))
    pdf.registerFontkit(fontkit)
    pdf.setTitle(`${texts.title} Lyvi – ${voucher.code}`)
    pdf.setAuthor("Lyvi – Anaïs Eynard")
    pdf.setCreator("lyvicare.com")
    pdf.setProducer("lyvicare.com")

    const page = pdf.getPage(0)
    // Canva pages do not start at 0 (the bottom edge is at y = 8.25 pt): positions are taken from the page's box
    const box = page.getMediaBox()
    const scale = box.width / TEMPLATE_WIDTH
    const top = box.y + box.height

    const fontBytes = readAsset(FONT_FILE)
    const font = await pdf.embedFont(fontBytes, { subset: true })
    // Characters missing from the font (emoji…) are dropped from the customer's texts
    const glyphs = fontkit.create(fontBytes)
    const safe = (text) => [...text].filter((char) => glyphs.hasGlyphForCodePoint(char.codePointAt(0))).join("")
    const write = (line, text) => {
        const [from, to] = DOTS[templateLang][line]
        const clean = safe(text)
        const maxWidth = (to - from - 28) * scale
        let size = TEXT_SIZE * scale
        while (size > MIN_SIZE * scale && font.widthOfTextAtSize(clean, size) > maxWidth) size -= 0.25
        page.drawText(clean, { x: box.x + (from + 14) * scale, y: top - BASELINES[line] * scale, size, font, color: INK })
    }

    write("care", careLabel(voucher))
    write("beneficiary", voucher.beneficiary)
    write("expires", formatDate(voucher.expires, voucher.lang))
    write("code", voucher.code)

    return Buffer.from(await pdf.save())
}

export const pdfFileName = (voucher) => `${TEXTS[voucher.lang].voucher.fileName}-${voucher.code}.pdf`

// ---------- Email ----------

const SITE_URL = "https://lyvicare.com"
const COLORS = { green: "#627156", darkGreen: "#2d3b23", cream: "#FAF2E8", text: "#333333", muted: "#6b6b6b" }

// The two practices, as in the site footer
function practices(lang) {
    const footer = FOOTER[lang]
    const floor = footer.lyon1.floor.replace(/<[^>]+>/g, "")
    return [
        [footer.lyon1.name, `${CONTACT_INFO.address.street}, ${floor}`, CONTACT_INFO.address.city],
        [footer.lyon5.name, CONTACT_INFO.addressLyon5.place, CONTACT_INFO.addressLyon5.street, CONTACT_INFO.addressLyon5.city],
    ]
}

// Site logo (src/assets/logos/lyviLogo.svg rendered as PNG at 3x: email clients do not show SVG images),
// sent as an inline image of the email so it shows even when remote images are blocked
const LOGO_FILE = "email/lyvi-logo.png"
const LOGO_CID = "lyvi-logo@lyvicare.com"

/** Subject, text and HTML versions of the voucher email (exported to preview it, with another logo address) */
export function voucherEmail(voucher, logoSrc = `cid:${LOGO_CID}`) {
    const texts = TEXTS[voucher.lang].email
    const values = { beneficiary: voucher.beneficiary }
    const summary = [
        [texts.labels.care, careLabel(voucher)],
        [texts.labels.beneficiary, voucher.beneficiary],
        [texts.labels.validUntil, formatDate(voucher.expires, voucher.lang)],
        [texts.labels.code, voucher.code],
    ]
    const places = practices(voucher.lang)
    const subject = fill(texts.subject, values)
    // French typography: space before the colon
    const colon = voucher.lang === "fr" ? " : " : ": "

    const text = [
        texts.greeting,
        fill(texts.intro, values),
        `${texts.summaryTitle}\n${summary.map(([label, value]) => `${label}${colon}${value}`).join("\n")}`,
        `${texts.bookingTitle}\n${fill(texts.booking, values)}\n${DOCTOLIB_URL}`,
        `${texts.practicesTitle}\n${places.map((lines) => lines.join(", ")).join("\n")}`,
        texts.questions,
        texts.signature,
        `lyvicare.com · ${CONTACT_INFO.phoneDisplay} · ${SHOP_EMAIL}`,
    ].join("\n\n")

    const e = escapeHtml
    const paragraph = (content) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.text}">${content}</p>`
    const title = (content) => `<h2 style="margin:28px 0 10px;font-size:17px;font-weight:bold;color:${COLORS.darkGreen}">${e(content)}</h2>`
    const link = `color:${COLORS.green};text-decoration:none`

    const html = `<!doctype html>
<html lang="${voucher.lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(subject)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.cream};font-family:Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${e(texts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px">
<tr><td align="center" style="background:${COLORS.green};border-radius:12px 12px 0 0;padding:22px 24px">
<a href="${SITE_URL}" style="text-decoration:none"><img src="${logoSrc}" width="86" height="56" alt="Lyvi" style="display:block;margin:0 auto;border:0;width:86px;height:56px;font-family:Georgia,serif;font-style:italic;font-size:30px;color:${COLORS.cream}"></a>
</td></tr>
<tr><td style="padding:32px 32px 8px">
${paragraph(e(texts.greeting))}
${paragraph(e(fill(texts.intro, values)))}
${title(texts.summaryTitle)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};border-radius:8px">
${summary.map(([label, value]) => `<tr><td style="padding:10px 16px;font-size:14px;color:${COLORS.muted};white-space:nowrap;vertical-align:top">${e(label)}</td><td style="padding:10px 16px;font-size:15px;font-weight:bold;color:${COLORS.darkGreen}">${e(value)}</td></tr>`).join("\n")}
</table>
${title(texts.bookingTitle)}
${paragraph(e(fill(texts.booking, values)))}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr><td style="background:${COLORS.green};border-radius:999px">
<a href="${DOCTOLIB_URL}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">${e(texts.bookingButton)}</a>
</td></tr></table>
${title(texts.practicesTitle)}
${places.map((lines) => paragraph(`<strong style="color:${COLORS.darkGreen}">${e(lines[0])}</strong><br>${lines.slice(1).map(e).join("<br>")}`)).join("\n")}
<div style="height:8px"></div>
${paragraph(e(texts.questions))}
${paragraph(e(texts.signature).replace(/\n/g, "<br>"))}
</td></tr>
<tr><td align="center" style="border-top:1px solid ${COLORS.cream};padding:18px 24px;font-size:13px;line-height:1.6;color:${COLORS.muted}">
<a href="${SITE_URL}" style="${link}">lyvicare.com</a> · ${e(CONTACT_INFO.phoneDisplay)} · <a href="mailto:${SHOP_EMAIL}" style="${link}">${SHOP_EMAIL}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
    return { subject, text, html }
}

async function sendVoucherEmail(voucher) {
    const { subject, text, html } = voucherEmail(voucher)
    const transporter = nodemailer.createTransport({
        host: "ssl0.ovh.net",
        port: 465,
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({
        from: `"Lyvi – Anaïs Eynard" <${SHOP_EMAIL}>`,
        to: voucher.email,
        bcc: SHOP_EMAIL,
        replyTo: SHOP_EMAIL,
        subject,
        text,
        html,
        attachments: [
            { filename: pdfFileName(voucher), content: await buildVoucherPdf(voucher), contentType: "application/pdf" },
            { filename: "lyvi.png", content: readAsset(LOGO_FILE), contentType: "image/png", cid: LOGO_CID, contentDisposition: "inline" },
        ],
    })
}

const escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char])
