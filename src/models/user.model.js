const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, unique: true, sparse: true }, // Made sparse/optional
    password: { type: String },
    role: {
      type: String,
      enum: ["customer", "admin", "manager", "staff"],
      default: "customer",
    },
    googleId: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
