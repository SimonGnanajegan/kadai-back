const express = require("express");
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    upsertCategoryTranslation,

    getCategoryTranslation,
    getCategoriesForAdmin,
} = require("../controllers/category.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);
router.post("/:id/translations", protect, admin, upsertCategoryTranslation);
router.get("/:id/translations/:lang", protect, admin, getCategoryTranslation);

// Admin List with ALL translations
router.get("/admin/list", protect, admin, getCategoriesForAdmin);

module.exports = router;
