const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
    {
        logo: { type: String, required: true },
        copyright: { type: String, required: true },
        description: { type: String },
        columns: [
            {
                title: { type: String, required: true },
                links: [
                    {
                        label: { type: String, required: true },
                        url: { type: String, required: true },
                        content: { type: String }, // HTML content for the page
                    },
                ],
            },
        ],
        socialLinks: [
            {
                platform: { type: String, required: true },
                icon: { type: String, required: true }, // e.g., "fa-facebook", "linkedin"
                url: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Footer", footerSchema);
