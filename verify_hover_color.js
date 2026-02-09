const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Settings = require("./src/models/settings.model");

dotenv.config({ path: path.join(__dirname, ".env") });

const verifyHoverColor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Fetch existing
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});

        console.log("Initial Hover Color:", settings.primaryHoverColor);

        // 2. Update Hover Color
        const newColor = "#D84315"; // Specific deep orange

        // Mock controller update logic
        settings.primaryHoverColor = newColor;
        await settings.save();

        // 3. Re-fetch
        const updated = await Settings.findOne();
        console.log("Updated Hover Color:", updated.primaryHoverColor);

        if (updated.primaryHoverColor !== newColor) {
            throw new Error("Update failed");
        }

        console.log("✅ Hover Color Verification Passed");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
};

verifyHoverColor();
