const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Footer = require("../models/footer.model");

dotenv.config();

const seedFooter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kadai-db");
        console.log("MongoDB Connected");

        const footerData = {
            logo: "https://via.placeholder.com/150x50?text=JJ+Tiffin",
            copyright: "© 2025 JJ Tiffin Limited. All rights reserved.",
            description: "Authentic home-style meals delivered to your doorstep. Taste the love in every bite.",
            columns: [
                {
                    title: "COMPANY",
                    links: [
                        {
                            label: "About Us",
                            url: "/about",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">About JJ Tiffin</h1>
                                    <p class="mb-4">Welcome to JJ Tiffin, where we bring the warmth of home-cooked meals directly to your table. Founded in 2023, our mission is to provide healthy, delicious, and affordable tiffin services to professionals and students.</p>
                                    <p class="mb-4">Our chefs use only the freshest ingredients and traditional recipes to ensure every meal feels like a hug from home.</p>
                                    <h2 class="text-2xl font-semibold mb-2">Our Mission</h2>
                                    <p>To revolutionize daily dining with nutritious, hygienic, and tasty food options.</p>
                                </div>
                            `
                        },
                        {
                            label: "Careers",
                            url: "/careers",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">Join Our Team</h1>
                                    <p class="mb-4">We are always looking for passionate individuals to join the JJ Tiffin family. If you love food and technology, check out our open positions.</p>
                                    <ul class="list-disc pl-5">
                                        <li>Senior Chef</li>
                                        <li>Delivery Partner</li>
                                        <li>Backend Developer</li>
                                    </ul>
                                    <p class="mt-4">Send your resume to careers@jjtiffin.com</p>
                                </div>
                            `
                        },
                        {
                            label: "Team",
                            url: "/team",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">Meet the Team</h1>
                                    <p>Our team is a diverse mix of foodies, techies, and operations gurus committed to serving you better.</p>
                                </div>
                            `
                        }
                    ]
                },
                {
                    title: "CONTACT US",
                    links: [
                        {
                            label: "Help & Support",
                            url: "/support",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">Help & Support</h1>
                                    <p class="mb-4">Have an issue with your order? We're here to help.</p>
                                    <p>Email: support@jjtiffin.com</p>
                                    <p>Phone: +91 98765 43210</p>
                                </div>
                            `
                        },
                        {
                            label: "Partner With Us",
                            url: "/partner",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">Partner With Us</h1>
                                    <p>Are you a corporate looking for bulk meals? Or a kitchen wanting to expand? Let's work together.</p>
                                </div>
                            `
                        }
                    ]
                },
                {
                    title: "LEGAL",
                    links: [
                        {
                            label: "Terms & Conditions",
                            url: "/terms",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">Terms & Conditions</h1>
                                    <p class="mb-4">Please read these terms carefully before using our service.</p>
                                    <h2 class="text-xl font-semibold mb-2">1. Service Usage</h2>
                                    <p class="mb-4">By placing an order, you agree to our pricing and delivery policies.</p>
                                    <h2 class="text-xl font-semibold mb-2">2. Cancellations</h2>
                                    <p>Orders can be cancelled up to 1 hour before the scheduled delivery slot.</p>
                                </div>
                            `
                        },
                        {
                            label: "Privacy Policy",
                            url: "/privacy",
                            content: `
                                <div class="container mx-auto px-4 py-8">
                                    <h1 class="text-3xl font-bold mb-4">Privacy Policy</h1>
                                    <p class="mb-4">Your privacy is important to us. This policy explains how we handle your data.</p>
                                    <p>We collect your name, address, and phone number solely for delivery purposes.</p>
                                </div>
                            `
                        }
                    ]
                }
            ],
            socialLinks: [
                {
                    platform: "LinkedIn",
                    icon: "linkedin",
                    url: "https://linkedin.com/company/jjtiffin"
                },
                {
                    platform: "Instagram",
                    icon: "instagram",
                    url: "https://instagram.com/jjtiffin"
                },
                {
                    platform: "Facebook",
                    icon: "facebook",
                    url: "https://facebook.com/jjtiffin"
                },
                {
                    platform: "Twitter",
                    icon: "twitter",
                    url: "https://twitter.com/jjtiffin"
                }
            ]
        };

        // Clear existing footer and create new one
        await Footer.deleteMany({});
        await Footer.create(footerData);

        console.log("Footer seeded successfully with rich content! 🌱");
        process.exit();
    } catch (error) {
        console.error("Error seeding footer:", error);
        process.exit(1);
    }
};

seedFooter();
