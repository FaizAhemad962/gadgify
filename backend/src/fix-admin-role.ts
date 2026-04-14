import prisma from "./config/database";
import bcryptjs from "bcryptjs";

async function fixAdminRole() {
  console.log("🔧 Admin Role Fix Script\n");

  const adminEmail = "super-admin@gadgify.com";

  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      console.log("❌ Admin user not found with email:", adminEmail);
      console.log("\nAsking for email to fix...");
      console.log("Please provide the admin email that needs to be fixed.");
      return;
    }

    console.log("Found user:");
    console.log("  📧 Email:", existingAdmin.email);
    console.log("  👤 Name:", existingAdmin.name);
    console.log("  🔐 Current Role:", existingAdmin.role);

    if (existingAdmin.role === "SUPER_ADMIN") {
      console.log("\n✅ User is already SUPER_ADMIN!");
      return;
    }

    // Option 1: Just update the role
    console.log("\n📝 Updating role to SUPER_ADMIN...");
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "SUPER_ADMIN" },
    });

    console.log("\n✅ Role updated successfully!");
    console.log("📊 Updated User:");
    console.log("   📧 Email:", updatedUser.email);
    console.log("   👤 Name:", updatedUser.name);
    console.log("   🔐 New Role:", updatedUser.role);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
