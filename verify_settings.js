const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Settings = require("./src/models/settings.model");

dotenv.config({ path: path.join(__dirname, ".env") });

const verifySettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Fetch existing settings (or create default)
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});

        console.log("Initial Settings (Featured Categories):", settings.features?.enableFeaturedCategories);

        // 2. Update Feature Flag
        const newVal = !settings.features?.enableFeaturedCategories;
        // Mocking controller update logic
        if (settings.features) {
            settings.features = { ...settings.features, enableFeaturedCategories: newVal };
        } else {
            settings.features = { enableFeaturedCategories: newVal };
        }
        await settings.save();

        // 3. Re-fetch
        const updated = await Settings.findOne();
        console.log("Updated Settings (Featured Categories):", updated.features?.enableFeaturedCategories);

        if (updated.features?.enableFeaturedCategories !== newVal) {
            throw new Error("Update failed");
        }

        console.log("✅ Settings Update Verified");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
};

verifySettings();
