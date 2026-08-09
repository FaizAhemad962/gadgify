import { Router, Response } from 'express'
import { authenticate } from '../middlewares/auth'
import { AuthRequest } from '../middlewares/auth'
import prisma from '../config/database'
import logger from '../utils/logger'

const router = Router()

const firstString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return typeof value === 'string' ? value : '';
}

// Get wishlist for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        product: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(wishlist)
  } catch (error) {
    logger.error(
      `Error fetching wishlist: ${error instanceof Error ? error.message : String(error)}`,
    )
    res.status(500).json({ message: 'Failed to fetch wishlist' })
  }
})

// Add product to wishlist
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Check if already in wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (existingWishlist) {
      return res.status(400).json({ message: 'Product already in wishlist' })
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    })

    res.status(201).json(wishlistItem)
  } catch (error) {
    logger.error(
      `Error adding to wishlist: ${error instanceof Error ? error.message : String(error)}`,
    )
    res.status(500).json({ message: 'Failed to add to wishlist' })
  }
})

// Remove product from wishlist
router.delete('/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const productId = firstString(req.params.productId)
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' })
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Item not in wishlist' })
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId },
      },
    })

    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    logger.error(
      `Error removing from wishlist: ${error instanceof Error ? error.message : String(error)}`,
    )
    res.status(500).json({ message: 'Failed to remove from wishlist' })
  }
})

export default router
