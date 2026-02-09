const express = require("express");
const router = express.Router();
const { getAllStaff, createStaff, updateStaff, deleteStaff } = require("../controllers/user.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Staff Management Routes
// Only Admin can create/update/delete staff
// Managers can view staff list
router.get("/staff", protect, authorize("admin", "manager"), getAllStaff);
router.post("/staff", protect, authorize("admin"), createStaff);
router.put("/staff/:id", protect, authorize("admin"), updateStaff);
router.delete("/staff/:id", protect, authorize("admin"), deleteStaff);

module.exports = router;
