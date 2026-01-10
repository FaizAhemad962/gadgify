import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Guard against destructive deletes in production for critical models
prisma.$use(async (params, next) => {
  if (process.env.NODE_ENV === 'production') {
    const dangerous = params.action === 'delete' || params.action === 'deleteMany'
    const protectedModels = ['User', 'Product', 'Order']
    if (dangerous && params.model && protectedModels.includes(params.model)) {
      throw new Error('Destructive delete blocked in production')
    }
  }
  return next(params)
})

// Handle disconnection on app termination
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma
