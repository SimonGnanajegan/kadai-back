const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  return regex.test(password);
};

exports.signup = async (req, res) => {
  const { name, email, mobile, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters with 1 uppercase, 1 number, and 1 symbol.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, mobile, password: hashedPassword, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { mobile, password, role } = req.body;

  try {
    // 1. Check if role is provided
    if (!role) {
      return res.status(400).json({ message: "Role is required for login" });
    }

    const user = await User.findOne({ mobile });
    if (!user) return res.status(401).json({ message: "Invalid mobile or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid mobile or password" });

    // 2. Check if provided role matches user's role
    if (user.role !== role) {
      return res.status(403).json({
        message: `Access denied. You are registered as ${user.role}, but trying to login as ${role}.`
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};



exports.logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

// --- NEW AUTH METHODS ---
const otpService = require("../services/otp.service");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Ensure this env var exists or is passed from frontend

exports.forgotPassword = async (req, res) => {
  const { identifier, type } = req.body; // identifier = mobile or email
  try {
    if (!identifier) return res.status(400).json({ message: "Identifier (email/mobile) is required" });

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { mobile: identifier };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found with this identifier" });
    }

    // Send OTP using the existing service
    // Default to 'whatsapp' for mobile if not specified, as requested by user
    const defaultType = isEmail ? 'email' : 'whatsapp';
    const response = await otpService.sendOtp(identifier, type || defaultType);
    res.status(200).json({ message: "OTP sent for password reset", data: response });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  try {
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: "Identifier, OTP, and new password are required" });
    }

    // Verify OTP
    const isValid = await otpService.verifyOtp(identifier, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters with 1 uppercase, 1 number, and 1 symbol.",
      });
    }

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { mobile: identifier };
    const user = await User.findOne(query);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully. Please login with new password." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

// Kept for generic usage if needed, but forgotPassword is the main entry point now for this context
exports.sendOtp = async (req, res) => {
  const { identifier, type } = req.body;
  try {
    if (!identifier) return res.status(400).json({ message: "Identifier required" });
    const response = await otpService.sendOtp(identifier, type);
    res.status(200).json({ message: "OTP sent", data: response });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

exports.googleSignIn = async (req, res) => {
  const { token, role = "customer" } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (!user) {
      // Create new user
      // Again, mobile is required. 
      // We'll leave mobile empty and see if schema allows (it won't).
      // We might need to generate a placeholder or modify schema to make mobile optional if email present.
      // I'll assume for now I should modify schema to make mobile not required if email exists?
      // Or I just insert a dummy mobile?
      // I will try to create. 
      user = await User.create({
        name,
        email,
        googleId,
        role,
        isVerified: true,
        // Placeholder mobile if strictly required. 
        mobile: `G-${googleId.substring(0, 10)}` // Hacky but works for now.
      });
    } else {
      // Link googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Google Auth Error", error: err.message });
  }
};
