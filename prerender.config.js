export default {
  routes: [
    "/fr",
    "/en",
    "/de",
    "/fr/a-propos",
    "/en/about",
    "/de/uber-mich",
    "/fr/soins",
    "/en/treatments",
    "/de/behandlungen",
    "/fr/contact",
    "/en/contact",
    "/de/kontakt",
    "/fr/faq",
    "/en/faq",
    "/de/faq",
  ],
  outDir: "static-pages",     // Dossier de sortie
  serveDir: "dist",            // Votre build Vite
  buildCommand: "vite build",  // Commande de build
  flatOutput: false            // false = /about/index.html, true = about.html
};