const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, role: true },
    });

    console.log("\n=== ALL USERS AND ROLES ===");
    users.forEach((u) => {
      console.log(`${u.email}: "${u.role}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkRoles();
