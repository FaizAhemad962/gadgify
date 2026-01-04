import prisma from './config/database'
import { hashPassword } from './utils/auth'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.rating.deleteMany({})
  await prisma.cartItem.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.cart.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('✅ Data cleared')

  console.log('✅ Database is now empty - ready for manual data entry')
  console.log('ℹ️  Create admin user: Sign up → Change role to ADMIN in database')
  console.log('ℹ️  Add products: Login as admin → Admin Dashboard → Manage Products')

  console.log('🎉 Seeding completed!')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
