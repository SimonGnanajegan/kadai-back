const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

// Import routes
const authRoutes = require("./routes/auth.routes");
const storeRoutes = require("./routes/store.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const searchRoutes = require("./routes/search.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const paymentRoutes = require("./routes/payment.routes");
const footerRoutes = require("./routes/footer.routes");
const settingsRoutes = require("./routes/settings.routes");
const bannerRoutes = require("./routes/banner.routes");
const userRoutes = require("./routes/user.routes");
const languageRoutes = require("./routes/language.routes");
const importRoutes = require("./routes/import.routes");

const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });
const app = express();

// CORS configuration for Angular frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allow text/csv for Import API
app.use(express.text({ type: ['text/csv', 'text/plain'], limit: '10mb' }));
app.use(morgan("dev"));

// Language Middleware
const languageMiddleware = require("./middlewares/language.middleware");
app.use(languageMiddleware);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected 🚀"))
    .catch(err => console.log("❌ MongoDB Error:", err));

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get("/test", (req, res) => {
    res.send("TEST OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", productRoutes); // Alias for Admin URLs
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", categoryRoutes); // Alias for Admin URLs
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/admin", importRoutes); // Mounts /api/admin/products/import
app.use("/api", storeRoutes);

// Start server
// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CORS enabled for: http://localhost:4200`);
});

// Initialize Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:4200",
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });
});

// Make io accessible globally or export if needed
app.set("io", io);

module.exports = { app, io };
