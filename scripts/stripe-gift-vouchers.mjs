// Creates (or updates) in Stripe the gift voucher products, their prices and their Payment Links, one set per
// language of the site (Stripe does not translate our own texts: product name, beneficiary field),
// then writes the links into src/constants/giftVouchers.ts.
//
//   node scripts/stripe-gift-vouchers.mjs [--base-url https://…] [--live]
//
// - Reads STRIPE_SECRET_KEY from .env (secret or restricted key). Refuses a live key unless --live is given.
// - Vouchers and prices come from src/constants/giftVouchers.ts (itself based on renataPrices.ts).
// - Can be run again safely: existing products/links are reused; a changed price gets a new price and a new link.
// - --base-url: site where Stripe sends the buyer after paying (default https://lyvicare.com;
//   a Netlify deploy preview URL while testing).

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"
import Stripe from "stripe"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const baseUrl = (args.includes("--base-url") ? args[args.indexOf("--base-url") + 1] : "https://lyvicare.com").replace(/\/$/, "")

// Secret key from .env (never printed)
const env = Object.fromEntries(fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)
    .filter((line) => /^\s*[A-Z_]+=/.test(line)).map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]))
const key = env.STRIPE_SECRET_KEY || ""
// Secret key (sk_) or restricted key (rk_) with write access to Products, Prices and Payment Links
if (!/^[sr]k_(test|live)_/.test(key)) throw new Error("STRIPE_SECRET_KEY missing or invalid in .env")
const live = /^[sr]k_live_/.test(key)
if (live && !args.includes("--live")) throw new Error("Live key in .env: add --live to really create the live products")
const mode = live ? "LIVE" : "test"
const stripe = new Stripe(key)

// Vouchers of the site (TypeScript constants, bundled on the fly)
const bundle = await build({ entryPoints: [path.join(root, "src/constants/giftVouchers.ts")], bundle: true, write: false, format: "esm", platform: "node" })
const tmpFile = path.join(root, "node_modules/.cache/gift-vouchers-constants.mjs")
fs.mkdirSync(path.dirname(tmpFile), { recursive: true })
fs.writeFileSync(tmpFile, bundle.outputFiles[0].text)
const { GIFT_VOUCHERS } = await import(pathToFileURL(tmpFile).href)
const LANGS = ["fr", "en", "de"]
const TEXTS = Object.fromEntries(LANGS.map((lang) => [lang, JSON.parse(fs.readFileSync(path.join(root, `public/locales/${lang}/giftVouchers.json`), "utf8"))]))

// Stripe objects of the vouchers (identified by metadata.voucher_id + metadata.lang; no lang = first French ones)
const products = []
for await (const product of stripe.products.list({ limit: 100, active: true })) if (product.metadata.voucher_id) products.push(product)
const links = []
for await (const link of stripe.paymentLinks.list({ limit: 100, active: true })) if (link.metadata.voucher_id) links.push(link)

const sameVoucher = (item, voucher, lang) => item.metadata.voucher_id === voucher.id && (item.metadata.lang || "fr") === lang

const redirectUrl = `${baseUrl}/.netlify/functions/gift-voucher-return?session_id={CHECKOUT_SESSION_ID}`
const linkSettings = (lang) => ({
    after_completion: { type: "redirect", redirect: { url: redirectUrl } },
    // The key "beneficiaire" is read by netlify/lib/giftVoucher.mjs
    custom_fields: [
        { key: "beneficiaire", label: { type: "custom", custom: TEXTS[lang].stripe.beneficiaryField }, type: "text", text: { maximum_length: 40 } },
    ],
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    submit_type: "pay",
})

const result = Object.fromEntries(LANGS.map((lang) => [lang, {}]))
console.log(`Stripe ${mode} mode, buyers redirected to ${baseUrl}\n`)
for (const lang of LANGS) for (const voucher of GIFT_VOUCHERS) {
    const texts = TEXTS[lang]
    const group = { 1: "single", 5: "cure5", 8: "cure8" }[voucher.sessions]
    const name = `${texts.voucher.title} – ${texts.card.cares[voucher.care]} – ${texts.card.groups[group]}`
    const amount = voucher.price * 100
    const metadata = { voucher_id: voucher.id, lang }

    // Product
    let product = products.find((item) => sameVoucher(item, voucher, lang))
    if (!product) {
        product = await stripe.products.create({ name, metadata, default_price_data: { currency: "eur", unit_amount: amount } })
    } else if (product.name !== name || product.metadata.lang !== lang) {
        product = await stripe.products.update(product.id, { name, metadata })
    }

    // Price: new one if the amount changed (Stripe prices cannot be edited)
    let price = await stripe.prices.retrieve(typeof product.default_price === "string" ? product.default_price : product.default_price.id)
    if (price.unit_amount !== amount) {
        const oldPrice = price
        price = await stripe.prices.create({ product: product.id, currency: "eur", unit_amount: amount })
        await stripe.products.update(product.id, { default_price: price.id })
        await stripe.prices.update(oldPrice.id, { active: false })
    }

    // Payment Link: reused if it already sells this price, otherwise replaced
    let link = links.find((item) => sameVoucher(item, voucher, lang))
    if (link) {
        const items = await stripe.paymentLinks.listLineItems(link.id)
        if (items.data[0]?.price.id !== price.id) {
            await stripe.paymentLinks.update(link.id, { active: false })
            link = null
        } else {
            const settings = linkSettings(lang)
            link = await stripe.paymentLinks.update(link.id, { after_completion: settings.after_completion, custom_fields: settings.custom_fields, metadata })
        }
    }
    if (!link) {
        link = await stripe.paymentLinks.create({
            ...linkSettings(lang),
            line_items: [{ price: price.id, quantity: 1 }],
            metadata,
            payment_intent_data: { metadata },
        })
    }

    result[lang][voucher.id] = link.url
    console.log(`${lang} ${voucher.id.padEnd(14)} ${String(voucher.price).padStart(4)} €  ${link.url}`)
}

// Links written into the site
const constantsFile = path.join(root, "src/constants/giftVouchers.ts")
const source = fs.readFileSync(constantsFile, "utf8")
const languageBlock = (lang) => `    ${lang}: {\n${Object.entries(result[lang]).map(([id, url]) => `        "${id}": "${url}",`).join("\n")}\n    },`
const block = `export const GIFT_VOUCHER_LINKS: Record<string, Record<string, string>> = {\n${LANGS.map(languageBlock).join("\n")}\n}`
fs.writeFileSync(constantsFile, source.replace(/export const GIFT_VOUCHER_LINKS: Record<[^=]*> = \{[\s\S]*?\n\}/, block))
const count = LANGS.reduce((total, lang) => total + Object.keys(result[lang]).length, 0)
console.log(`\n${count} links written to src/constants/giftVouchers.ts (${mode} mode)`)
