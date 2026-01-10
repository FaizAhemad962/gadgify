"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
async function seed() {
    console.log('🌱 Seeding database...');
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await database_1.default.rating.deleteMany({});
    await database_1.default.cartItem.deleteMany({});
    await database_1.default.orderItem.deleteMany({});
    await database_1.default.order.deleteMany({});
    await database_1.default.cart.deleteMany({});
    await database_1.default.product.deleteMany({});
    await database_1.default.user.deleteMany({});
    console.log('✅ Data cleared');
    console.log('✅ Database is now empty - ready for manual data entry');
    console.log('ℹ️  Create admin user: Sign up → Change role to ADMIN in database');
    console.log('ℹ️  Add products: Login as admin → Admin Dashboard → Manage Products');
    console.log('🎉 Seeding completed!');
}
seed()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await database_1.default.$disconnect();
});
