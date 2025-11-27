export const CONTACT_INFO = {
    phone: "+33782132897",
    phoneDisplay: "+33 7 82 13 28 97",
    email: "contact@lyvicare.com",
    address: {
        name: "Coream - Espace Santé & Bien-être",
        street: () => (
            <>
                22 Rue Pizay, 1<sup>er</sup> étage
            </>
        ),
        city: "69001 Lyon",
        country: "France"
    }
} as const
