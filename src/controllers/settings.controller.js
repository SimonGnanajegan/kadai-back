const Settings = require("../models/settings.model");

// Get Settings (Public)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if not exists
            settings = await Settings.create({});
        }
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching settings", error: err.message });
    }
};

// Update Settings (Admin)
exports.updateSettings = async (req, res) => {
    try {
        const { appName, logo, primaryColor, primaryHoverColor, tax, features } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.appName = appName || settings.appName;
        settings.logo = logo || settings.logo;
        settings.primaryColor = primaryColor || settings.primaryColor;
        settings.primaryHoverColor = primaryHoverColor || settings.primaryHoverColor;

        if (tax) settings.tax = { ...settings.tax, ...tax };
        if (features) settings.features = { ...settings.features, ...features };

        await settings.save();
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json({ message: "Error updating settings", error: err.message });
    }
};
