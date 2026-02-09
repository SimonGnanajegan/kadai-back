const mongoose = require('mongoose');

const TranslationKeySchema = new mongoose.Schema({
    keyCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    }, // e.g., 'product.101.name'
    description: { type: String }, // Internal note for translators
}, { timestamps: true });

module.exports = mongoose.model('TranslationKey', TranslationKeySchema);
