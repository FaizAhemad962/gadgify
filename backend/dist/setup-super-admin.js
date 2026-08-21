"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function setupSuperAdmin() {
    console.log("Setting up Super Admin account...");
    const email = process.env.SUPER_ADMIN_EMAIL || "";
    const password = process.env.SUPER_ADMIN_PASSWORD || "";
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const existingAdmin = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            const updatedAdmin = await database_1.default.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: "SUPER_ADMIN",
                    emailVerified: true,
                    deletedAt: null,
                },
            });
            console.log("Super Admin already exists; credentials repaired.");
            console.log("Email:", email);
            console.log("Password:", password);
            console.log("Role:", updatedAdmin.role);
            return;
        }
        const superAdmin = await database_1.default.user.create({
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
                emailVerified: true,
            },
        });
        console.log("Super Admin account created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Name:", superAdmin.name);
        console.log("Phone:", superAdmin.phone);
        console.log("City:", superAdmin.city);
        console.log("Role:", superAdmin.role);
        console.log("WARNING: Change this password immediately after first login.");
    }
    catch (error) {
        console.error("Error setting up Super Admin:", error);
        throw error;
    }
    finally {
        await database_1.default.$disconnect();
    }
}
setupSuperAdmin();
