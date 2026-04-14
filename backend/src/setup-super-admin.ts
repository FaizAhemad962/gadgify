import prisma from "./config/database";
import bcryptjs from "bcryptjs";

async function setupSuperAdmin() {
  console.log("🔐 Setting up Super Admin account...");

  const email = "super-admin@gadgify.com";
  const password = "super-admin9606@";

  try {
    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("✅ Super Admin already exists");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);
      console.log("👤 Role:", existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Super Admin",
        phone: "9000000000",
        role: "SUPER_ADMIN",
        state: "Maharashtra",
        city: "Mumbai",
        address: "Gadgify HQ, Mumbai",
        pincode: "400001",
      },
    });

    console.log("✅ Super Admin account created successfully!");
    console.log("📊 Super Admin Details:");
    console.log("   📧 Email:", email);
    console.log("   🔑 Password:", password);
    console.log("   👤 Name:", superAdmin.name);
    console.log("   📞 Phone:", superAdmin.phone);
    console.log("   🏙️  City:", superAdmin.city);
    console.log("   🔐 Role:", superAdmin.role);
    console.log(
      "\n⚠️  WARNING: Change this password immediately after first login!",
    );
  } catch (error) {
    console.error("❌ Error setting up Super Admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupSuperAdmin();
