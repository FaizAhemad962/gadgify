import prisma from './config/database'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.wishlist.deleteMany({})
  await prisma.rating.deleteMany({})
  await prisma.cartItem.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.cart.deleteMany({})
  await prisma.productMedia.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('✅ Data cleared')

  // Create sample products with categories and original prices
  console.log('📦 Adding sample products...')
  
  const products = [
    // Home & Kitchen (6 products)
    { name: 'Mop', category: 'Home & Kitchen', price: 149, originalPrice: 599, stock: 50, hsnNo: '9603', gstPercentage: 5, description: 'Microfiber cleaning mop with long handle' },
    { name: 'Mat', category: 'Home & Kitchen', price: 249, originalPrice: 999, stock: 40, hsnNo: '5703', gstPercentage: 5, description: 'Premium door mat for home entrance' },
    { name: 'Kitchen Appliances Set', category: 'Home & Kitchen', price: 899, originalPrice: 4999, stock: 20, hsnNo: '8516', gstPercentage: 18, description: 'Complete kitchen utility set with 12 pieces' },
    { name: 'Washing Machine', category: 'Home & Kitchen', price: 7999, originalPrice: 35999, stock: 5, hsnNo: '8450', gstPercentage: 18, description: '7kg automatic washing machine' },
    { name: 'Towel Set', category: 'Home & Kitchen', price: 199, originalPrice: 799, stock: 100, hsnNo: '6209', gstPercentage: 5, description: 'Pack of 2 premium cotton towels' },
    { name: 'Storage Containers Set', category: 'Home & Kitchen', price: 449, originalPrice: 1999, stock: 60, hsnNo: '3923', gstPercentage: 18, description: 'Set of 5 airtight plastic containers' },

    // Electronics (8 products)
    { name: 'Laptop', category: 'Electronics', price: 24999, originalPrice: 99999, stock: 10, hsnNo: '8471', gstPercentage: 18, description: '15.6" HD Laptop with 8GB RAM and 256GB SSD' },
    { name: 'Air Cooler', category: 'Electronics', price: 1999, originalPrice: 7999, stock: 25, hsnNo: '8414', gstPercentage: 18, description: 'Personal air cooler for room cooling' },
    { name: 'LED Charging Light', category: 'Electronics', price: 399, originalPrice: 1599, stock: 60, hsnNo: '9405', gstPercentage: 18, description: 'USB rechargeable LED study lamp' },
    { name: 'Digital Clock', category: 'Electronics', price: 649, originalPrice: 2599, stock: 45, hsnNo: '9110', gstPercentage: 12, description: 'LED digital alarm clock with temperature display' },
    { name: 'Bluetooth Speaker', category: 'Electronics', price: 1299, originalPrice: 4999, stock: 35, hsnNo: '8518', gstPercentage: 18, description: 'Portable wireless bluetooth speaker' },
    { name: 'USB Power Bank', category: 'Electronics', price: 599, originalPrice: 2499, stock: 80, hsnNo: '8507', gstPercentage: 18, description: '20000mAh dual port power bank' },
    { name: 'Mobile Phone Stand', category: 'Electronics', price: 199, originalPrice: 799, stock: 100, hsnNo: '7326', gstPercentage: 18, description: 'Adjustable metal phone stand' },
    { name: 'Webcam HD', category: 'Electronics', price: 1899, originalPrice: 5999, stock: 20, hsnNo: '8525', gstPercentage: 18, description: '1080P HD webcam for video calls' },

    // Beauty & Personal Care (5 products)
    { name: 'Face Wash Kit', category: 'Beauty & Personal Care', price: 749, originalPrice: 2999, stock: 35, hsnNo: '3304', gstPercentage: 18, description: 'Complete skincare face wash set' },
    { name: 'Body Lotion Pack', category: 'Beauty & Personal Care', price: 449, originalPrice: 1799, stock: 50, hsnNo: '3305', gstPercentage: 18, description: 'Moisturizing body lotion 500ml' },
    { name: 'Hair Oil', category: 'Beauty & Personal Care', price: 299, originalPrice: 1199, stock: 70, hsnNo: '3305', gstPercentage: 18, description: 'Coconut hair oil for smooth and shiny hair' },
    { name: 'Toothbrush Set', category: 'Beauty & Personal Care', price: 199, originalPrice: 799, stock: 100, hsnNo: '9619', gstPercentage: 18, description: 'Pack of 3 soft bristle toothbrushes' },
    { name: 'Soap Set', category: 'Beauty & Personal Care', price: 349, originalPrice: 1399, stock: 60, hsnNo: '3401', gstPercentage: 18, description: 'Pack of 5 fragrant bath soaps' },

    // Office & Storage (7 products)
    { name: 'File Organizer', category: 'Office & Storage', price: 99, originalPrice: 399, stock: 200, hsnNo: '4819', gstPercentage: 5, description: 'Desktop file organizer with 4 slots' },
    { name: 'Drawer Storage Organizer', category: 'Office & Storage', price: 449, originalPrice: 1799, stock: 30, hsnNo: '4819', gstPercentage: 5, description: '13 grid drawer organizer for office supplies' },
    { name: 'Document Holder', category: 'Office & Storage', price: 299, originalPrice: 1199, stock: 40, hsnNo: '4819', gstPercentage: 5, description: 'Portable car document holder' },
    { name: 'Jewelry Box', category: 'Office & Storage', price: 399, originalPrice: 1599, stock: 50, hsnNo: '4202', gstPercentage: 18, description: 'Velvet jewelry storage box' },
    { name: 'Storage Bags', category: 'Office & Storage', price: 649, originalPrice: 2599, stock: 25, hsnNo: '6307', gstPercentage: 5, description: 'Set of 3 non-woven storage bags for wardrobe' },
    { name: 'Desk Organizer Set', category: 'Office & Storage', price: 799, originalPrice: 3199, stock: 35, hsnNo: '4819', gstPercentage: 18, description: 'Complete desk organizer with 6 compartments' },
    { name: 'Plastic Boxes Set', category: 'Office & Storage', price: 299, originalPrice: 1199, stock: 45, hsnNo: '3923', gstPercentage: 18, description: 'Set of 4 stackable transparent storage boxes' },

    // Sports & Outdoor (6 products)
    { name: 'Sports Kit', category: 'Sports & Outdoor', price: 1249, originalPrice: 4999, stock: 15, hsnNo: '9506', gstPercentage: 18, description: 'Complete outdoor sports equipment set' },
    { name: 'Cricket Bat', category: 'Sports & Outdoor', price: 999, originalPrice: 3999, stock: 20, hsnNo: '9506', gstPercentage: 18, description: 'Kashmir willow cricket bat' },
    { name: 'Sports Helmet', category: 'Sports & Outdoor', price: 1499, originalPrice: 5999, stock: 18, hsnNo: '6506', gstPercentage: 18, description: 'Safety helmet for cycling and sports' },
    { name: 'Badminton Set', category: 'Sports & Outdoor', price: 749, originalPrice: 2999, stock: 25, hsnNo: '9506', gstPercentage: 18, description: 'Complete badminton set with rackets and shuttles' },
    { name: 'Yoga Mat', category: 'Sports & Outdoor', price: 499, originalPrice: 1999, stock: 40, hsnNo: '4011', gstPercentage: 18, description: 'Non-slip exercise yoga mat' },
    { name: 'Dumbbells Set', category: 'Sports & Outdoor', price: 1599, originalPrice: 6399, stock: 12, hsnNo: '7326', gstPercentage: 18, description: 'Adjustable dumbbells set 1-10kg' },

    // Jewelry & Accessories (5 products)
    { name: 'Silver Necklace', category: 'Jewelry & Accessories', price: 1499, originalPrice: 5999, stock: 30, hsnNo: '7117', gstPercentage: 18, description: 'Elegant 925 silver necklace' },
    { name: 'Pearl Earrings', category: 'Jewelry & Accessories', price: 999, originalPrice: 3999, stock: 40, hsnNo: '7113', gstPercentage: 18, description: 'Classic pearl stud earrings' },
    { name: 'Jewelry Box', category: 'Jewelry & Accessories', price: 599, originalPrice: 2399, stock: 35, hsnNo: '4202', gstPercentage: 18, description: 'Velvet lined jewelry storage box' },
    { name: 'Fashion Bracelet', category: 'Jewelry & Accessories', price: 699, originalPrice: 2799, stock: 50, hsnNo: '7117', gstPercentage: 18, description: 'Stylish metal fashion bracelet' },
    { name: 'Watch', category: 'Jewelry & Accessories', price: 2999, originalPrice: 11999, stock: 20, hsnNo: '9104', gstPercentage: 18, description: 'Analog wrist watch with leather strap' },

    // Toys (4 products)
    { name: 'Flying Drone', category: 'Toys', price: 1999, originalPrice: 7999, stock: 15, hsnNo: '9503', gstPercentage: 18, description: 'Mini quadcopter drone with camera' },
    { name: 'Building Blocks Set', category: 'Toys', price: 699, originalPrice: 2799, stock: 40, hsnNo: '9503', gstPercentage: 18, description: 'Educational building blocks set 500 pieces' },
    { name: 'Action Figure', category: 'Toys', price: 299, originalPrice: 1199, stock: 50, hsnNo: '9503', gstPercentage: 18, description: 'Superhero action figure collectible' },
    { name: 'Puzzle Game', category: 'Toys', price: 399, originalPrice: 1599, stock: 35, hsnNo: '9503', gstPercentage: 18, description: '3D wooden puzzle game' },

    // Tools & Hardware (5 products)
    { name: 'Wire Cutter', category: 'Tools & Hardware', price: 399, originalPrice: 3599, stock: 30, hsnNo: '8203', gstPercentage: 18, description: 'Professional wire cutter tool' },
    { name: 'Angle Grinder', category: 'Tools & Hardware', price: 2499, originalPrice: 9999, stock: 8, hsnNo: '8205', gstPercentage: 18, description: 'Heavy duty angle grinder for cutting' },
    { name: 'Drill Machine', category: 'Tools & Hardware', price: 3499, originalPrice: 13999, stock: 10, hsnNo: '8207', gstPercentage: 18, description: 'Cordless electric drill machine' },
    { name: 'Tool Set', category: 'Tools & Hardware', price: 999, originalPrice: 3999, stock: 25, hsnNo: '8205', gstPercentage: 18, description: 'Complete hand tool set 100 pieces' },
    { name: 'Safety Gloves', category: 'Tools & Hardware', price: 199, originalPrice: 799, stock: 100, hsnNo: '6216', gstPercentage: 18, description: 'Leather work gloves' },

    // Lighting (4 products)
    { name: 'Solar LED Light', category: 'Lighting', price: 999, originalPrice: 3999, stock: 30, hsnNo: '9405', gstPercentage: 18, description: 'Solar powered LED outdoor light' },
    { name: 'LED Strip Lights', category: 'Lighting', price: 499, originalPrice: 1999, stock: 50, hsnNo: '9405', gstPercentage: 18, description: '5m RGB LED light strips with remote' },
    { name: 'Desk Lamp', category: 'Lighting', price: 699, originalPrice: 2799, stock: 40, hsnNo: '9405', gstPercentage: 18, description: 'LED desk lamp with adjustable brightness' },
    { name: 'Night Light', category: 'Lighting', price: 299, originalPrice: 1199, stock: 60, hsnNo: '9405', gstPercentage: 18, description: 'Soft glow night light for bedroom' },
  ]

  const createdProducts = await prisma.product.createMany({
    data: products,
  })

  console.log(`✅ Created ${createdProducts.count} products`)

  // Create sample users - 3 regular users and 1 admin
  console.log('👥 Adding sample users...')
  
  const users = [
    {
      email: 'user1@example.com',
      password: 'hashedPassword123',
      name: 'Raj Kumar',
      phone: '9876543210',
      role: 'USER',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: '123 MG Road, Mumbai',
      pincode: '400001',
    },
    {
      email: 'user2@example.com',
      password: 'hashedPassword123',
      name: 'Priya Sharma',
      phone: '8765432109',
      role: 'USER',
      state: 'Maharashtra',
      city: 'Pune',
      address: '456 FC Road, Pune',
      pincode: '411001',
    },
    {
      email: 'user3@example.com',
      password: 'hashedPassword123',
      name: 'Anil Patel',
      phone: '7654321098',
      role: 'USER',
      state: 'Maharashtra',
      city: 'Nagpur',
      address: '789 Dharampeth, Nagpur',
      pincode: '440001',
    },
    {
      email: 'admin@example.com',
      password: 'hashedPassword123',
      name: 'Admin User',
      phone: '9999999999',
      role: 'ADMIN',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: '999 Admin Tower, Mumbai',
      pincode: '400050',
    },
  ]

  const createdUsers = await prisma.user.createMany({
    data: users,
  })

  console.log(`✅ Created ${createdUsers.count} users (3 regular + 1 admin)`)

  // Create carts for regular users
  console.log('🛒 Creating carts for users...')
  const regularUsers = await prisma.user.findMany({
    where: { role: 'USER' },
    take: 3,
  })

  for (const user of regularUsers) {
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    })
  }

  console.log(`✅ Created carts for ${regularUsers.length} users`)

  console.log('🎉 Seeding completed!')
  console.log('📊 Summary:')
  console.log(`   - Products: ${createdProducts.count}`)
  console.log(`   - Users: ${createdUsers.count} (3 regular users + 1 admin)`)
  console.log(`   - Categories: 10 (Home & Kitchen, Electronics, Beauty & Personal Care, Office & Storage, Sports & Outdoor, Jewelry & Accessories, Toys, Tools & Hardware, Lighting)`)
  console.log('ℹ️  Admin login: admin@example.com / hashedPassword123')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
