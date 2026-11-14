// Chrome (used by the prerender) is stored inside node_modules, so that Netlify keeps it
// in its build cache together with the dependencies. The default location (~/.cache/puppeteer)
// is not cached by Netlify: when node_modules came from the cache, Chrome was missing.
const { join } = require("path")

module.exports = {
    cacheDirectory: join(__dirname, "node_modules", ".cache", "puppeteer"),
}
