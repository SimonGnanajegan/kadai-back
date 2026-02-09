const mongoose = require('mongoose');

const productTranslationSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    lang: {
        type: String,
        required: true,
        // enum: ['en', 'ta'], // Removed strict enum to allow unlimited languages as per requirement
        index: true
    },
    name: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['DRAFT', 'APPROVED'],
        default: 'APPROVED' // Default to APPROVED for migration simplicity, strict workflow can change this later
    }
}, { timestamps: true });

// Compound index to ensure one translation per language per product
productTranslationSchema.index({ product: 1, lang: 1 }, { unique: true });

module.exports = mongoose.model('ProductTranslation', productTranslationSchema);
