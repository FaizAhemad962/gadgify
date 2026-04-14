import prisma from "./config/database";
import bcryptjs from "bcryptjs";

async function deleteAndRecreateAdmin() {
  console.log("🔄 Delete and Recreate Super Admin\n");

  const adminEmail = "super-admin@gadgify.com";
  const password = "super-admin9606@";

  try {
    // Step 1: Delete existing admin if exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("🗑️  Deleting existing user:", adminEmail);
      await prisma.user.delete({
        where: { email: adminEmail },
      });
      console.log("✅ User deleted");
    }

    // Step 2: Create fresh super admin
    console.log("\n✨ Creating fresh Super Admin...");
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
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

    console.log("\n✅ Super Admin created successfully!");
    console.log("📊 New Admin Account:");
    console.log("   📧 Email:", newAdmin.email);
    console.log("   👤 Name:", newAdmin.name);
    console.log("   📞 Phone:", newAdmin.phone);
    console.log("   🏙️  City:", newAdmin.city);
    console.log("   🔐 Role:", newAdmin.role);
    console.log("\n🔑 Login with:");
    console.log("   Email:", adminEmail);
    console.log("   Password:", password);
    console.log(
      "\n⚠️  WARNING: Change password immediately after first login!",
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndRecreateAdmin();
