export const CONTACT_INFO = {
    phone: "+33782132897",
    phoneDisplay: "+33 7 82 13 28 97",
    email: "contact@lyvicare.com",
    address: {
        // The floor ("1st floor") is translated: see "lyon1.floor" in footer.json
        street: "22 Rue Pizay",
        city: "69001 Lyon"
    },
    // Second practice (Saint-Cyr-au-Mont-d'Or). Key name kept from the former Lyon 5 practice.
    addressLyon5: {
        place: "La Villa des Monts d'Or",
        street: "15 Route de Lyon",
        city: "69450 Saint-Cyr-au-Mont-d'Or"
    }
} as const
