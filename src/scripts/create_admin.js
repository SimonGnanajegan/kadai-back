const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/user.model");

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kadai-db");
        console.log("MongoDB Connected");

        const mobile = "9994561437";
        const password = "Abc@123";
        const name = "Admin User";
        const email = "admin@kadai.com"; // Optional but good to have

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({ mobile });

        if (user) {
            user.password = hashedPassword;
            user.role = "admin";
            user.name = name;
            // user.email = email; // Optional: update email if needed
            await user.save();
            console.log("Admin user updated successfully");
        } else {
            await User.create({
                name,
                email,
                mobile,
                password: hashedPassword,
                role: "admin",
            });
            console.log("Admin user created successfully");
        }

        process.exit();
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
};

createAdmin();
