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

export const TEXTS = { fr, en, de }
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

async function sendVoucherEmail(voucher) {
    const texts = TEXTS[voucher.lang].email
    const values = { beneficiary: voucher.beneficiary, care: careLabel(voucher), date: formatDate(voucher.expires, voucher.lang) }
    const text = [texts.greeting, fill(texts.body, values), texts.booking, texts.signature].join("\n\n")

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
        subject: `${texts.subject} – ${voucher.code}`,
        text,
        html: text.split("\n\n").map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join(""),
        attachments: [{ filename: pdfFileName(voucher), content: await buildVoucherPdf(voucher), contentType: "application/pdf" }],
    })
}

const escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char])
