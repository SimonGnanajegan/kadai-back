const TranslationKey = require('../models/translationKey.model');
const Translation = require('../models/translation.model');

// Simple in-memory cache for demo purposes (Use Redis in production)
const cache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour

class TranslationService {
    constructor() {
        this.fallbackLang = 'en';
    }

    /**
     * Resolve a single translation key
     * @param {string} keyCode - The key code (e.g. 'product.101.name')
     * @param {string} lang - Language code (e.g. 'ta')
     * @returns {Promise<string>} - The translated string or fallback logic
     */
    async resolve(keyCode, lang = 'en') {
        const cacheKey = `i18n:${lang}:${keyCode}`;

        // 1. Check Cache
        if (cache.has(cacheKey)) {
            const entry = cache.get(cacheKey);
            if (Date.now() < entry.expiry) {
                return entry.value;
            }
            cache.delete(cacheKey);
        }

        try {
            // Get Key ID first (could also cache this map)
            const keyDoc = await TranslationKey.findOne({ keyCode });

            if (!keyDoc) {
                // Key doesn't exist? Return key code as fail-safe
                return keyCode;
            }

            // 2. Fetch Translation
            let translation = await Translation.findOne({ key: keyDoc._id, languageCode: lang });

            // 3. Fallback Logic
            if (!translation && lang !== this.fallbackLang) {
                // Try fallback language
                translation = await Translation.findOne({ key: keyDoc._id, languageCode: this.fallbackLang });
            }

            const result = translation ? translation.value : keyCode; // Return key if absolutely no translation found

            // 4. Set Cache
            cache.set(cacheKey, { value: result, expiry: Date.now() + CACHE_TTL });

            return result;
        } catch (err) {
            console.error("Translation Error:", err);
            return keyCode;
        }
    }

    /**
     * Batch resolve multiple keys
     * @param {string[]} keyCodes 
     * @param {string} lang 
     */
    async resolveBatch(keyCodes, lang = 'en') {
        // Optimization: Implement bulk query here to avoid N+1
        // For now, mapping over single resolve for simplicity
        const results = {};
        await Promise.all(keyCodes.map(async (code) => {
            results[code] = await this.resolve(code, lang);
        }));
        return results;
    }
}

module.exports = new TranslationService();
