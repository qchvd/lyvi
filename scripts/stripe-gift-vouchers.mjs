// Creates (or updates) in Stripe the gift voucher products, their prices and their Payment Links,
// then writes the links into src/constants/giftVouchers.ts.
//
//   node scripts/stripe-gift-vouchers.mjs [--base-url https://…] [--live]
//
// - Reads STRIPE_SECRET_KEY from .env. Refuses a live key (sk_live_) unless --live is given.
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
if (!/^sk_(test|live)_/.test(key)) throw new Error("STRIPE_SECRET_KEY missing or invalid in .env")
if (key.startsWith("sk_live_") && !args.includes("--live")) throw new Error("Live key in .env: add --live to really create the live products")
const mode = key.startsWith("sk_live_") ? "LIVE" : "test"
const stripe = new Stripe(key)

// Vouchers of the site (TypeScript constants, bundled on the fly)
const bundle = await build({ entryPoints: [path.join(root, "src/constants/giftVouchers.ts")], bundle: true, write: false, format: "esm", platform: "node" })
const tmpFile = path.join(root, "node_modules/.cache/gift-vouchers-constants.mjs")
fs.mkdirSync(path.dirname(tmpFile), { recursive: true })
fs.writeFileSync(tmpFile, bundle.outputFiles[0].text)
const { GIFT_VOUCHERS } = await import(pathToFileURL(tmpFile).href)
const fr = JSON.parse(fs.readFileSync(path.join(root, "public/locales/fr/giftVouchers.json"), "utf8"))

// Stripe objects of the vouchers (identified by metadata.voucher_id)
const products = []
for await (const product of stripe.products.list({ limit: 100, active: true })) if (product.metadata.voucher_id) products.push(product)
const links = []
for await (const link of stripe.paymentLinks.list({ limit: 100, active: true })) if (link.metadata.voucher_id) links.push(link)

const redirectUrl = `${baseUrl}/.netlify/functions/gift-voucher-return?session_id={CHECKOUT_SESSION_ID}`
const linkSettings = {
    after_completion: { type: "redirect", redirect: { url: redirectUrl } },
    custom_fields: [
        { key: "beneficiaire", label: { type: "custom", custom: "Prénom du bénéficiaire" }, type: "text", text: { maximum_length: 40 } },
    ],
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    submit_type: "pay",
}

const result = {}
console.log(`Stripe ${mode} mode, buyers redirected to ${baseUrl}\n`)
for (const voucher of GIFT_VOUCHERS) {
    const group = { 1: "single", 5: "cure5", 8: "cure8" }[voucher.sessions]
    const name = `Bon cadeau – ${fr.card.cares[voucher.care]} – ${fr.card.groups[group]}`
    const amount = voucher.price * 100

    // Product
    let product = products.find((item) => item.metadata.voucher_id === voucher.id)
    if (!product) {
        product = await stripe.products.create({ name, metadata: { voucher_id: voucher.id }, default_price_data: { currency: "eur", unit_amount: amount } })
    } else if (product.name !== name) {
        product = await stripe.products.update(product.id, { name })
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
    let link = links.find((item) => item.metadata.voucher_id === voucher.id)
    if (link) {
        const items = await stripe.paymentLinks.listLineItems(link.id)
        if (items.data[0]?.price.id !== price.id) {
            await stripe.paymentLinks.update(link.id, { active: false })
            link = null
        } else {
            link = await stripe.paymentLinks.update(link.id, { after_completion: linkSettings.after_completion, custom_fields: linkSettings.custom_fields })
        }
    }
    if (!link) {
        link = await stripe.paymentLinks.create({
            ...linkSettings,
            line_items: [{ price: price.id, quantity: 1 }],
            metadata: { voucher_id: voucher.id },
            payment_intent_data: { metadata: { voucher_id: voucher.id } },
        })
    }

    result[voucher.id] = link.url
    console.log(`${voucher.id.padEnd(14)} ${String(voucher.price).padStart(4)} €  ${link.url}`)
}

// Links written into the site
const constantsFile = path.join(root, "src/constants/giftVouchers.ts")
const source = fs.readFileSync(constantsFile, "utf8")
const block = `export const GIFT_VOUCHER_LINKS: Record<string, string> = {\n${Object.entries(result).map(([id, url]) => `    "${id}": "${url}",`).join("\n")}\n}`
fs.writeFileSync(constantsFile, source.replace(/export const GIFT_VOUCHER_LINKS: Record<string, string> = \{[\s\S]*?\n\}/, block))
console.log(`\n${Object.keys(result).length} links written to src/constants/giftVouchers.ts (${mode} mode)`)
