const express = require("express");
const router = express.Router();
const {
    getBanners,
    getAllBannersAdmin,
    createBanner,
    updateBanner,
    deleteBanner,
} = require("../controllers/banner.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

router.get("/", getBanners);
router.get("/admin", protect, admin, getAllBannersAdmin);
router.post("/", protect, admin, createBanner);
router.put("/:id", protect, admin, updateBanner);
router.delete("/:id", protect, admin, deleteBanner);

module.exports = router;
