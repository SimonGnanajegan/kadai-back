const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., 'en', 'ta', 'fr'
    name: { type: String, required: true }, // "English", "Tamil"
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Language', LanguageSchema);
