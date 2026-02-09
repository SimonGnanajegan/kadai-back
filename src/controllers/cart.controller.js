const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate(
            "items.product",
            "name price images"
        );

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error fetching cart", error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
            });
        }

        // Recalculate total price
        cart.totalPrice = cart.items.reduce(
            (acc, item) => acc + item.quantity * item.price,
            0
        );

        await cart.save();

        // Re-fetch to populate
        cart = await Cart.findById(cart._id).populate(
            "items.product",
            "name price images"
        );

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error adding to cart", error: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            if (quantity > 0) {
                cart.items[itemIndex].quantity = quantity;
            } else {
                cart.items.splice(itemIndex, 1);
            }
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        cart.totalPrice = cart.items.reduce(
            (acc, item) => acc + item.quantity * item.price,
            0
        );

        await cart.save();

        cart = await Cart.findById(cart._id).populate(
            "items.product",
            "name price images"
        );

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error updating cart", error: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        cart.totalPrice = cart.items.reduce(
            (acc, item) => acc + item.quantity * item.price,
            0
        );

        await cart.save();

        cart = await Cart.findById(cart._id).populate(
            "items.product",
            "name price images"
        );

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error removing from cart", error: err.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
        }
        res.status(200).json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ message: "Error clearing cart", error: err.message });
    }
};
