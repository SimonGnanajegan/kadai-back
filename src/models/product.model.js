const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        taxRate: { type: Number, default: 0 }, // Percentage (e.g., 5 for 5%)
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        images: [{ type: String }],
        stock: { type: Number, required: true, default: 0 },
        attributes: {
            type: Map,
            of: String, // e.g., { "size": "M", "color": "Red" }
        },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        enableReviews: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
