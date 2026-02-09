const Banner = require("../models/banner.model");

// Get Active Banners (Public)
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.status(200).json(banners);
    } catch (err) {
        res.status(500).json({ message: "Error fetching banners", error: err.message });
    }
};

// Get All Banners (Admin)
exports.getAllBannersAdmin = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json(banners);
    } catch (err) {
        res.status(500).json({ message: "Error fetching banners", error: err.message });
    }
};

// Create Banner (Admin)
exports.createBanner = async (req, res) => {
    try {
        const { imageUrl, link, isActive, order } = req.body;
        const banner = await Banner.create({ imageUrl, link, isActive, order });
        res.status(201).json(banner);
    } catch (err) {
        res.status(500).json({ message: "Error creating banner", error: err.message });
    }
};

// Update Banner (Admin)
exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        res.status(200).json(banner);
    } catch (err) {
        res.status(500).json({ message: "Error updating banner", error: err.message });
    }
};

// Delete Banner (Admin)
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        res.status(200).json({ message: "Banner deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting banner", error: err.message });
    }
};
