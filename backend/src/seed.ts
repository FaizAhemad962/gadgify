import prisma from './config/database'
import { hashPassword } from './utils/auth'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gadgify.com' },
    update: {},
    create: {
      email: 'admin@gadgify.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '9876543210',
      role: 'ADMIN',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: '123 Admin Street',
      pincode: '400001',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test user
  const userPassword = await hashPassword('user123')
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      phone: '9876543211',
      role: 'USER',
      state: 'Maharashtra',
      city: 'Pune',
      address: '456 User Street',
      pincode: '411001',
    },
  })
  console.log('✅ Test user created:', user.email)

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
      price: 129900,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
      category: 'Smartphones',
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android flagship with AI features and S Pen',
      price: 124999,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
      category: 'Smartphones',
    },
    {
      name: 'MacBook Pro 14"',
      description: 'Powerful laptop with M3 Pro chip for professionals',
      price: 199900,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      category: 'Laptops',
    },
    {
      name: 'Dell XPS 15',
      description: 'Premium Windows laptop with OLED display',
      price: 165000,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
      category: 'Laptops',
    },
    {
      name: 'iPad Pro 12.9"',
      description: 'Powerful tablet with M2 chip and Liquid Retina XDR display',
      price: 112900,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
      category: 'Tablets',
    },
    {
      name: 'AirPods Pro 2',
      description: 'Premium wireless earbuds with active noise cancellation',
      price: 24900,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
      category: 'Audio',
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling headphones',
      price: 29990,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
      category: 'Audio',
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Advanced smartwatch with health monitoring features',
      price: 41900,
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500',
      category: 'Wearables',
    },
  ]

  // First, clear existing products
  await prisma.product.deleteMany({})
  
  // Then create new products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }
  console.log('✅ Sample products created:', products.length)

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
