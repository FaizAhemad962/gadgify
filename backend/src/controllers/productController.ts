import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    })

    // Calculate average rating for each product
    const productsWithRatings = products.map((product) => {
      const ratings = product.ratings
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
        : 0
      const totalRatings = ratings.length

      const { ratings: _, ...productData } = product
      return {
        ...productData,
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings,
      }
    })

    res.json(productsWithRatings)
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, price, stock, imageUrl, videoUrl, colors, category, weight } = req.body

    const product = await prisma.product.create({
      data: { name, description, price, stock, imageUrl, videoUrl, colors, category, weight: weight || 0.5 },
    })

    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, price, stock, imageUrl, videoUrl, colors, category, weight } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock, imageUrl, videoUrl, colors, category, weight: weight || 0.5 },
    })

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.product.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q as string } },
          { description: { contains: q as string } },
          { category: { contains: q as string } },
        ],
      },
    })
    res.json(products)
  } catch (error) {
    next(error)
  }
}
