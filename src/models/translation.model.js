const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
    key: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TranslationKey',
        required: true
    },
    languageCode: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: 5 // e.g. 'en', 'en-US'
    },
    value: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Ensure unique translation for a key + language
TranslationSchema.index({ key: 1, languageCode: 1 }, { unique: true });

module.exports = mongoose.model('Translation', TranslationSchema);
