const Language = require('../models/language.model');

exports.getAllLanguages = async (req, res) => {
    try {
        const languages = await Language.find().sort({ createdAt: 1 });
        res.status(200).json(languages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching languages", error: err.message });
    }
};

exports.createLanguage = async (req, res) => {
    try {
        const { code, name, isDefault } = req.body;

        if (isDefault) {
            // Unset other defaults
            await Language.updateMany({}, { isDefault: false });
        }

        const language = await Language.create({ code, name, isDefault });
        res.status(201).json(language);
    } catch (err) {
        res.status(500).json({ message: "Error creating language", error: err.message });
    }
};

exports.updateLanguage = async (req, res) => {
    try {
        const { isDefault } = req.body;
        if (isDefault) {
            await Language.updateMany({}, { isDefault: false });
        }

        const language = await Language.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(language);
    } catch (err) {
        res.status(500).json({ message: "Error updating language", error: err.message });
    }
};

exports.deleteLanguage = async (req, res) => {
    try {
        await Language.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Language deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting language", error: err.message });
    }
};
