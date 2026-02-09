const express = require("express");
const router = express.Router();
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, getWishlist);
router.post("/add", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);

module.exports = router;
