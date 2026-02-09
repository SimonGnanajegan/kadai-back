const mongoose = require('mongoose');

const categoryTranslationSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    lang: {
        type: String,
        required: true,
        index: true
    },
    name: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

// Compound index
categoryTranslationSchema.index({ category: 1, lang: 1 }, { unique: true });

module.exports = mongoose.model('CategoryTranslation', categoryTranslationSchema);
