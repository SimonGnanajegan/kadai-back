const SUPPORTED_LANGUAGES = ['en', 'ta', 'fr', 'es']; // Add as needed
const DEFAULT_LANGUAGE = 'en';

const languageMiddleware = (req, res, next) => {
    try {
        const header = req.headers['accept-language'];
        let lang = DEFAULT_LANGUAGE;

        if (header) {
            // Header format: "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5"
            // We strip region codes for simplicity (fr-CH -> fr)
            const requestedLang = header.split(',')[0].trim().split(';')[0].split('-')[0];

            if (SUPPORTED_LANGUAGES.includes(requestedLang)) {
                lang = requestedLang;
            }
        }

        // Attach to request object
        req.language = lang;
        next();
    } catch (err) {
        req.language = DEFAULT_LANGUAGE;
        next();
    }
};

module.exports = languageMiddleware;
