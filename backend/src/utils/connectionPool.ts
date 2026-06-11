import prisma from "../config/database";
import logger from "./logger";

export const initializeConnectionPool = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection pool initialized successfully");
  } catch (error) {
    logger.error(
      `Failed to initialize connection pool: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
};

export const closeConnectionPool = async () => {
  try {
    await prisma.$disconnect();
    logger.info("Database connections closed gracefully");
  } catch (error) {
    logger.error(
      `Error closing database connections: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const checkConnectionHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error(
      `Connection health check failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
};

export const reconnectDatabase = async (
  maxRetries: number = 3,
): Promise<boolean> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const isHealthy = await checkConnectionHealth();
      if (isHealthy) {
        logger.info("Database reconnected successfully");
        return true;
      }
    } catch (error) {
      retries++;
      logger.warn(
        `Reconnection attempt ${retries}/${maxRetries} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  logger.error("Failed to reconnect after maximum retries");
  return false;
};
