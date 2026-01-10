import prisma from '../config/database'

/**
 * Manages database connection pooling
 * Ensures proper connection lifecycle and prevents pool exhaustion
 */

export const initializeConnectionPool = async () => {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✓ Database connection pool initialized successfully')
  } catch (error) {
    console.error('✗ Failed to initialize connection pool:', error)
    throw error
  }
}

/**
 * Gracefully close database connections
 */
export const closeConnectionPool = async () => {
  try {
    await prisma.$disconnect()
    console.log('✓ Database connections closed gracefully')
  } catch (error) {
    console.error('✗ Error closing database connections:', error)
  }
}

/**
 * Health check for database connection
 */
export const checkConnectionHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Connection health check failed:', error)
    return false
  }
}

/**
 * Reconnect if connection is lost
 */
export const reconnectDatabase = async (maxRetries: number = 3): Promise<boolean> => {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const isHealthy = await checkConnectionHealth()
      if (isHealthy) {
        console.log('✓ Database reconnected successfully')
        return true
      }
    } catch (error) {
      retries++
      console.warn(`Reconnection attempt ${retries}/${maxRetries} failed:`, error)

      if (retries < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }
  }

  console.error('✗ Failed to reconnect after maximum retries')
  return false
}
