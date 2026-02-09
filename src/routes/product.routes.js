const express = require("express");
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    upsertProductTranslation,

    getProductTranslation,
    getProductsForAdmin,
} = require("../controllers/product.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/category/:categoryId", getProductsByCategory);

// Admin routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/translations", protect, admin, upsertProductTranslation);
router.get("/:id/translations/:lang", protect, admin, getProductTranslation);

// Admin List with ALL translations
router.get("/admin/list", protect, admin, getProductsForAdmin);

// Review Routes
const { createProductReview, getProductReviews } = require("../controllers/review.controller");

router.post("/:id/reviews", protect, createProductReview);
router.get("/:id/reviews", getProductReviews);

module.exports = router;
