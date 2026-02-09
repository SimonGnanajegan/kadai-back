const Footer = require("../models/footer.model");

// Get Footer Configuration (Public)
exports.getFooter = async (req, res) => {
    try {
        let footer = await Footer.findOne();

        // Return default structure if no footer config exists
        if (!footer) {
            return res.status(200).json({
                logo: "",
                copyright: "© 2025 JJ Tiffin Limited",
                description: "",
                columns: [],
                socialLinks: []
            });
        }

        res.status(200).json(footer);
    } catch (err) {
        res.status(500).json({ message: "Error fetching footer", error: err.message });
    }
};

// Update Footer Configuration (Admin)
exports.updateFooter = async (req, res) => {
    try {
        const { logo, copyright, description, columns, socialLinks } = req.body;

        let footer = await Footer.findOne();

        if (footer) {
            // Update existing
            footer.logo = logo;
            footer.copyright = copyright;
            footer.description = description;
            footer.columns = columns;
            footer.socialLinks = socialLinks;
            await footer.save();
        } else {
            // Create new
            footer = await Footer.create({
                logo,
                copyright,
                description,
                columns,
                socialLinks
            });
        }

        res.status(200).json(footer);
    } catch (err) {
        res.status(500).json({ message: "Error updating footer", error: err.message });
    }
};
