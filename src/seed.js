const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/category.model");
const Product = require("./models/product.model");

dotenv.config();

const categories = [
    {
        name: "Italian Cuisine",
        slug: "italian-cuisine",
        image: "https://images.unsplash.com/photo-1498579397066-22750a3cb424?w=400",
        description: "Authentic Italian dishes and ingredients"
    },
    {
        name: "Indian Cuisine",
        slug: "indian-cuisine",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        description: "Spicy and flavorful Indian delicacies"
    },
    {
        name: "Chinese Cuisine",
        slug: "chinese-cuisine",
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400",
        description: "Traditional and modern Chinese food"
    },
    {
        name: "Mexican Cuisine",
        slug: "mexican-cuisine",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
        description: "Vibrant and bold Mexican flavors"
    },
    {
        name: "Japanese Cuisine",
        slug: "japanese-cuisine",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
        description: "Fresh sushi, ramen, and Japanese specialties"
    },
    {
        name: "Beverages",
        slug: "beverages",
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
        description: "Refreshing drinks and beverages"
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log("🧹 Cleared existing data");

        // Insert categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Added ${createdCategories.length} categories`);

        // Create products for each category
        const products = [];

        // Italian products
        const italianCat = createdCategories.find(c => c.slug === "italian-cuisine");
        products.push(
            {
                name: "Margherita Pizza",
                slug: "margherita-pizza",
                description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
                price: 12.99,
                discountPrice: 10.99,
                category: italianCat._id,
                images: [
                    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400"
                ],
                stock: 50,
                rating: 4.5,
                numReviews: 120,
                isFeatured: true
            },
            {
                name: "Spaghetti Carbonara",
                slug: "spaghetti-carbonara",
                description: "Creamy pasta with pancetta, eggs, and parmesan cheese",
                price: 14.99,
                category: italianCat._id,
                images: ["https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400"],
                stock: 40,
                rating: 4.7,
                numReviews: 95
            },
            {
                name: "Tiramisu",
                slug: "tiramisu",
                description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
                price: 7.99,
                category: italianCat._id,
                images: ["https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400"],
                stock: 30,
                rating: 4.8,
                numReviews: 150
            }
        );

        // Indian products
        const indianCat = createdCategories.find(c => c.slug === "indian-cuisine");
        products.push(
            {
                name: "Butter Chicken",
                slug: "butter-chicken",
                description: "Tender chicken in a rich, creamy tomato-based sauce",
                price: 15.99,
                discountPrice: 13.99,
                category: indianCat._id,
                images: ["https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400"],
                stock: 60,
                rating: 4.9,
                numReviews: 200,
                isFeatured: true
            },
            {
                name: "Chicken Biryani",
                slug: "chicken-biryani",
                description: "Aromatic basmati rice with spiced chicken and herbs",
                price: 13.99,
                category: indianCat._id,
                images: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"],
                stock: 45,
                rating: 4.6,
                numReviews: 180
            },
            {
                name: "Paneer Tikka",
                slug: "paneer-tikka",
                description: "Grilled cottage cheese marinated in spices",
                price: 11.99,
                category: indianCat._id,
                images: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400"],
                stock: 35,
                rating: 4.4,
                numReviews: 85
            }
        );

        // Chinese products
        const chineseCat = createdCategories.find(c => c.slug === "chinese-cuisine");
        products.push(
            {
                name: "Kung Pao Chicken",
                slug: "kung-pao-chicken",
                description: "Spicy stir-fried chicken with peanuts and vegetables",
                price: 12.99,
                category: chineseCat._id,
                images: ["https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400"],
                stock: 50,
                rating: 4.5,
                numReviews: 110
            },
            {
                name: "Fried Rice",
                slug: "fried-rice",
                description: "Classic fried rice with vegetables and egg",
                price: 9.99,
                category: chineseCat._id,
                images: ["https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"],
                stock: 70,
                rating: 4.3,
                numReviews: 140,
                isFeatured: true
            },
            {
                name: "Spring Rolls",
                slug: "spring-rolls",
                description: "Crispy vegetable spring rolls with sweet chili sauce",
                price: 6.99,
                category: chineseCat._id,
                images: ["https://images.unsplash.com/photo-1593252719340-a7cf2f18e5ff?w=400"],
                stock: 80,
                rating: 4.2,
                numReviews: 90
            }
        );

        // Mexican products
        const mexicanCat = createdCategories.find(c => c.slug === "mexican-cuisine");
        products.push(
            {
                name: "Chicken Tacos",
                slug: "chicken-tacos",
                description: "Soft tortillas filled with seasoned chicken and fresh toppings",
                price: 10.99,
                category: mexicanCat._id,
                images: ["https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400"],
                stock: 55,
                rating: 4.6,
                numReviews: 125
            },
            {
                name: "Beef Burrito",
                slug: "beef-burrito",
                description: "Large flour tortilla wrapped with beef, beans, rice, and cheese",
                price: 13.99,
                discountPrice: 11.99,
                category: mexicanCat._id,
                images: ["https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400"],
                stock: 40,
                rating: 4.7,
                numReviews: 160,
                isFeatured: true
            },
            {
                name: "Guacamole & Chips",
                slug: "guacamole-chips",
                description: "Fresh guacamole served with crispy tortilla chips",
                price: 7.99,
                category: mexicanCat._id,
                images: ["https://images.unsplash.com/photo-1534940519139-f860fb3c6e38?w=400"],
                stock: 60,
                rating: 4.4,
                numReviews: 100
            }
        );

        // Japanese products
        const japaneseCat = createdCategories.find(c => c.slug === "japanese-cuisine");
        products.push(
            {
                name: "California Roll",
                slug: "california-roll",
                description: "Sushi roll with crab, avocado, and cucumber",
                price: 11.99,
                category: japaneseCat._id,
                images: ["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"],
                stock: 45,
                rating: 4.5,
                numReviews: 135
            },
            {
                name: "Ramen Bowl",
                slug: "ramen-bowl",
                description: "Hot noodle soup with pork, egg, and vegetables",
                price: 14.99,
                category: japaneseCat._id,
                images: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"],
                stock: 50,
                rating: 4.8,
                numReviews: 175,
                isFeatured: true
            },
            {
                name: "Tempura",
                slug: "tempura",
                description: "Lightly battered and fried shrimp and vegetables",
                price: 12.99,
                category: japaneseCat._id,
                images: ["https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400"],
                stock: 35,
                rating: 4.3,
                numReviews: 80
            }
        );

        // Beverages
        const beverageCat = createdCategories.find(c => c.slug === "beverages");
        products.push(
            {
                name: "Mango Lassi",
                slug: "mango-lassi",
                description: "Sweet and creamy yogurt drink with mango",
                price: 4.99,
                category: beverageCat._id,
                images: ["https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400"],
                stock: 100,
                rating: 4.6,
                numReviews: 95
            },
            {
                name: "Green Tea",
                slug: "green-tea",
                description: "Traditional Japanese green tea",
                price: 3.99,
                category: beverageCat._id,
                images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"],
                stock: 120,
                rating: 4.4,
                numReviews: 110
            },
            {
                name: "Fresh Orange Juice",
                slug: "fresh-orange-juice",
                description: "Freshly squeezed orange juice",
                price: 5.99,
                category: beverageCat._id,
                images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400"],
                stock: 90,
                rating: 4.7,
                numReviews: 130
            }
        );

        // Insert products
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ Added ${createdProducts.length} products`);

        console.log("\n🎉 Database seeded successfully!");
        console.log(`📊 Summary:`);
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - Products: ${createdProducts.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
