const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Get All Staff (Admin & Manager)
exports.getAllStaff = async (req, res) => {
    try {
        // Fetch users with role 'manager' or 'staff'
        const staff = await User.find({ role: { $in: ["manager", "staff"] } }).select("-password");
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ message: "Error fetching staff", error: err.message });
    }
};

// Create Staff (Admin Only)
exports.createStaff = async (req, res) => {
    const { name, email, mobile, password, role } = req.body;
    try {
        const userExists = await User.findOne({ mobile });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: role || "staff", // Default to staff if not specified
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating staff", error: err.message });
    }
};

// Update Staff (Admin Only)
exports.updateStaff = async (req, res) => {
    try {
        const { name, email, mobile, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name || user.name;
        user.email = email || user.email;
        user.mobile = mobile || user.mobile;
        user.role = role || user.role;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        await user.save();
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating staff", error: err.message });
    }
};

// Delete Staff (Admin Only)
exports.deleteStaff = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "Staff deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting staff", error: err.message });
    }
};
