const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        appName: { type: String, default: "JJ Tiffin" },
        logo: { type: String }, // URL
        primaryColor: { type: String, default: "#FF5722" }, // Default Orange
        primaryHoverColor: { type: String, default: "#E64A19" },
        tax: {
            defaultTaxRate: { type: Number, default: 0 }, // Percentage
        },
        features: {
            enableDeliveryInstructions: { type: Boolean, default: true },
            enableScheduleDelivery: { type: Boolean, default: true },
            enableDelivery: { type: Boolean, default: true },
            enableTakeaway: { type: Boolean, default: true },
            enableFeaturedCategories: { type: Boolean, default: true },
            enableReviews: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
