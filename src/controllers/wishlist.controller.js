const Wishlist = require("../models/wishlist.model");
const Product = require("../models/product.model");

exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
            "products",
            "name price images"
        );

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.status(200).json(wishlist);
    } catch (err) {
        res.status(500).json({ message: "Error fetching wishlist", error: err.message });
    }
};

exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        wishlist = await Wishlist.findById(wishlist._id).populate(
            "products",
            "name price images"
        );

        res.status(200).json(wishlist);
    } catch (err) {
        res.status(500).json({ message: "Error adding to wishlist", error: err.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;

    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        wishlist = await Wishlist.findById(wishlist._id).populate(
            "products",
            "name price images"
        );

        res.status(200).json(wishlist);
    } catch (err) {
        res.status(500).json({ message: "Error removing from wishlist", error: err.message });
    }
};
