import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AuthRequest } from '../middlewares/auth'

export const getRatings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params

    const ratings = await prisma.rating.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
      : 0

    res.json({
      ratings,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
    })
  } catch (error) {
    next(error)
  }
}

export const createRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params
    const { rating, comment } = req.body
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    // Create or update rating
    const userRating = await prisma.rating.upsert({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        productId,
        userId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    res.status(201).json(userRating)
  } catch (error) {
    next(error)
  }
}

export const deleteRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    await prisma.rating.delete({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
