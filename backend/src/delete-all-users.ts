import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllUsers() {
  console.log("⚠️  WARNING: This will delete ALL users from the database!");
  console.log("Proceeding in 2 seconds...\n");

  try {
    const result = await prisma.user.deleteMany();
    console.log(`✅ Successfully deleted ${result.count} users`);
  } catch (error) {
    console.error("❌ Error deleting users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
