const express = require("express");
const router = express.Router();
const { getFooter, updateFooter } = require("../controllers/footer.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// Public route to get footer
router.get("/", getFooter);

// Admin route to update footer
router.put("/", protect, admin, updateFooter);

module.exports = router;
