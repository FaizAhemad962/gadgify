import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null } as any,
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
    const productsWithRatings = (products as any[]).map((product) => {
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
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } as any })

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
    const { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage } = req.body

    const product = await prisma.product.create({
      data: { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage },
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
    const { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage },
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
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ message: 'Product not found' })
      return
    }
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } as any })
    res.status(200).json({ message: 'Product archived' })
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
        deletedAt: null,
        OR: [
          { name: { contains: q as string } },
          { description: { contains: q as string } },
          { category: { contains: q as string } },
        ],
      } as any,
    })
    res.json(products)
  } catch (error) {
    next(error)
  }
}

export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 25
    const search = (req.query.search as string) || ''

    const skip = (page - 1) * limit

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { category: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, ...(searchFilter as any) } as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where: { deletedAt: null, ...(searchFilter as any) } as any }),
    ])

    // Calculate average rating for each product
    const productsWithRatings = (products as any[]).map((product) => {
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

    res.json({
      products: productsWithRatings,
      total,
    })
  } catch (error) {
    next(error)
  }
}
