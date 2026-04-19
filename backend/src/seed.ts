import prisma from "./config/database";
import bcryptjs from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  try {
    await prisma.wishlist.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.productMedia.deleteMany({});
    await prisma.product.deleteMany({});
    console.log("✅ Data cleared");
  } catch (error) {
    console.warn("⚠️  Warning during data cleanup:", error);
  }

  // Create sample products with categories and original prices
  console.log("📦 Adding sample products...");

  const products = [
    {
      name: "Eye Glass Cleaner Spray",
      description: "Quick-drying spray for eyeglasses, screens and lenses.",
      price: 199,
      originalPrice: 299,
      stock: 150,
      category: "Accessories",
      colors: "",
      hsnNo: "340220",
      gstPercentage: 18,
    },
    {
      name: "2 in 1 Eye Mask with Pillow",
      description: "Comfortable eye mask with neck pillow for travel.",
      price: 549,
      originalPrice: 799,
      stock: 120,
      category: "Travel",
      colors: "",
      hsnNo: "940490",
      gstPercentage: 12,
    },
    {
      name: "Stylish Backpack",
      description: "Durable backpack for travel, college and daily use.",
      price: 899,
      originalPrice: 1299,
      stock: 100,
      category: "Bags",
      colors: "",
      hsnNo: "420292",
      gstPercentage: 18,
    },
    {
      name: "Mini Lint Remover",
      description: "Portable lint remover for clothes and furniture.",
      price: 249,
      originalPrice: 399,
      stock: 200,
      category: "Home Utility",
      colors: "",
      hsnNo: "850980",
      gstPercentage: 18,
    },
    {
      name: "64 PCS Lotto Mini Wet Wipes",
      description: "Pocket-sized wet wipes for hygiene on the go.",
      price: 199,
      originalPrice: 299,
      stock: 300,
      category: "Personal Care",
      colors: "",
      hsnNo: "340119",
      gstPercentage: 18,
    },
    {
      name: "Mini Digital Camera",
      description: "Compact digital camera for kids and casual use.",
      price: 899,
      originalPrice: 1399,
      stock: 80,
      category: "Electronics",
      colors: "",
      hsnNo: "852580",
      gstPercentage: 18,
    },
    {
      name: "Harry Potter Keychain",
      description: "Premium themed keychain for fans.",
      price: 299,
      originalPrice: 499,
      stock: 250,
      category: "Accessories",
      colors: "",
      hsnNo: "830810",
      gstPercentage: 18,
    },
    {
      name: "Magnetic Multipurpose COB Light",
      description: "Bright LED light with magnetic base.",
      price: 499,
      originalPrice: 799,
      stock: 180,
      category: "Home Gadgets",
      colors: "",
      hsnNo: "940540",
      gstPercentage: 18,
    },
    {
      name: "3 Grid Ice Cream Maker Mold",
      description: "Reusable ice cream mold for homemade desserts.",
      price: 249,
      originalPrice: 399,
      stock: 200,
      category: "Kitchen",
      colors: "",
      hsnNo: "392410",
      gstPercentage: 18,
    },
    {
      name: "48 PCS Car Container Set",
      description: "Multipurpose container set for storage and organization.",
      price: 1299,
      originalPrice: 1899,
      stock: 90,
      category: "Storage",
      colors: "",
      hsnNo: "392490",
      gstPercentage: 18,
    },
    {
      name: "Magic Harry Potter Wand",
      description: "Collector’s edition magical wand.",
      price: 2199,
      originalPrice: 2999,
      stock: 70,
      category: "Toys & Collectibles",
      colors: "",
      hsnNo: "950300",
      gstPercentage: 12,
    },
    {
      name: "Electric Bottle Cleaner",
      description: "Rechargeable electric bottle and jar cleaner.",
      price: 699,
      originalPrice: 999,
      stock: 160,
      category: "Kitchen Gadgets",
      colors: "",
      hsnNo: "850940",
      gstPercentage: 18,
    },
    {
      name: "12 PCS Professional Drawing Pencil Set",
      description: "Artist-grade pencils for sketching and shading.",
      price: 349,
      originalPrice: 599,
      stock: 220,
      category: "Stationery",
      colors: "",
      hsnNo: "960910",
      gstPercentage: 12,
    },
    {
      name: "3 PCS Stylish Backpack Set",
      description: "Combo backpack set for travel and daily use.",
      price: 799,
      originalPrice: 1199,
      stock: 110,
      category: "Bags",
      colors: "",
      hsnNo: "420292",
      gstPercentage: 18,
    },
    {
      name: "25 in 1 Screwdriver Set",
      description: "Precision screwdriver kit for gadgets and electronics.",
      price: 399,
      originalPrice: 699,
      stock: 200,
      category: "Tools",
      colors: "",
      hsnNo: "820540",
      gstPercentage: 18,
    },
    {
      name: "Eco Friendly Reusable Cotton Veg Bag (10 PCS)",
      description: "Reusable cotton bags for vegetables and groceries.",
      price: 599,
      originalPrice: 899,
      stock: 140,
      category: "Eco Products",
      colors: "",
      hsnNo: "630790",
      gstPercentage: 5,
    },
    {
      name: "5 in 1 Premium Veg Slicer",
      description: "Multi-blade vegetable slicer for kitchen.",
      price: 999,
      originalPrice: 1499,
      stock: 130,
      category: "Kitchen Gadgets",
      colors: "",
      hsnNo: "821599",
      gstPercentage: 18,
    },
    {
      name: "Kitchen Foam Cleaner (500ml)",
      description: "Powerful foam cleaner for kitchen grease.",
      price: 299,
      originalPrice: 499,
      stock: 200,
      category: "Cleaning",
      colors: "",
      hsnNo: "340290",
      gstPercentage: 18,
    },
    {
      name: "Shoe Whitening Agent",
      description: "Instant whitening solution for shoes.",
      price: 199,
      originalPrice: 349,
      stock: 180,
      category: "Footwear Care",
      colors: "",
      hsnNo: "340510",
      gstPercentage: 18,
    },
    {
      name: "Shoe Cleaner Liquid",
      description: "Deep cleaning liquid for shoes.",
      price: 199,
      originalPrice: 349,
      stock: 180,
      category: "Footwear Care",
      colors: "",
      hsnNo: "340510",
      gstPercentage: 18,
    },
    {
      name: "64 PCS Stain Remover Wipes",
      description: "Instant stain remover wipes for fabrics.",
      price: 249,
      originalPrice: 399,
      stock: 220,
      category: "Cleaning",
      colors: "",
      hsnNo: "340119",
      gstPercentage: 18,
    },
    {
      name: "Insulated Lunch Bag",
      description: "Thermal insulated lunch bag.",
      price: 699,
      originalPrice: 1099,
      stock: 120,
      category: "Bags",
      colors: "",
      hsnNo: "420292",
      gstPercentage: 18,
    },
    {
      name: "Baby Bath Towel",
      description: "Soft and absorbent towel for babies.",
      price: 549,
      originalPrice: 799,
      stock: 150,
      category: "Baby Care",
      colors: "",
      hsnNo: "630260",
      gstPercentage: 5,
    },
    {
      name: "24 PCS Dual Tip Marker",
      description: "Professional dual-tip markers for artists.",
      price: 399,
      originalPrice: 699,
      stock: 180,
      category: "Stationery",
      colors: "",
      hsnNo: "960820",
      gstPercentage: 12,
    },
    {
      name: "Travel Organizer Bag",
      description: "Organizer bag for travel accessories.",
      price: 449,
      originalPrice: 699,
      stock: 160,
      category: "Travel Accessories",
      colors: "",
      hsnNo: "420292",
      gstPercentage: 18,
    },
    {
      name: "180 Ltr Storage Organizer",
      description: "Large capacity storage organizer for home.",
      price: 1299,
      originalPrice: 1899,
      stock: 70,
      category: "Storage",
      colors: "",
      hsnNo: "392490",
      gstPercentage: 18,
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          ...product,
          media: {
            create: [
              {
                url: "/uploads/product-1767471801486-579409941.jpeg",
                type: "image",
                isPrimary: true,
              },
            ],
          },
        },
      }),
    ),
  );

  console.log(`✅ Created ${createdProducts.length} products with images`);

  // Create super admin user

  console.log("👥 Adding super admin...");

  const hashedPassword = await bcryptjs.hash("FTej?Vz7+CqFM?J", 10);

  try {
    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "super-admin@gadgify.com" },
    });

    let createdUsers = { count: 0 };

    if (!existingAdmin) {
      const users = [
        {
          email: "super-admin@gadgify.com",
          password: hashedPassword,
          name: "Super Admin",
          phone: "",
          role: "SUPER_ADMIN",
          state: "Maharashtra",
          city: "",
          address: "",
          pincode: "",
        },
      ];

      createdUsers = await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      });

      console.log(`✅ Created ${createdUsers.count} super admin account`);
    } else {
      console.log("ℹ️  Super Admin already exists");
    }

    console.log("🎉 Seeding completed!");
    console.log("📊 Summary:");
    // console.log(`   - Products: ${createdProducts.length} (with images)`);
    console.log(`   - Images added: 1 primary image per product`);
    console.log(
      `   - Categories: 15+ (Accessories, Travel, Bags, Home Utility, Personal Care, Electronics, Home Gadgets, Kitchen, Storage, Toys & Collectibles, Stationery, Tools, Eco Products, Cleaning, Footwear Care, Baby Care, Travel Accessories)`,
    );
    console.log("🖼️  Product images linked from: /uploads/product-*.jpeg");
    console.log("ℹ️  Super Admin Account:");
    console.log("   Email: super-admin@gadgify.com");
    console.log("   Password: super-admin9606@");
    console.log("   Role: SUPER_ADMIN");
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  }
}

seed()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
