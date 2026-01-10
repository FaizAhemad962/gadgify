import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AuthRequest } from '../middlewares/auth'

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: { product: true },
          },
        },
      })
    }

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity } = req.body
    const userId = req.user!.id

    // Check if product exists and has stock
    const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } as any })
    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    if (product.stock < quantity) {
      res.status(400).json({ message: 'Insufficient stock' })
      return
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    })

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      })
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    res.json(updatedCart)
  } catch (error) {
    next(error)
  }
}

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    })

    if (!cartItem || cartItem.cart.userId !== req.user!.id) {
      res.status(404).json({ message: 'Cart item not found' })
      return
    }

    if (cartItem.product.stock < quantity) {
      res.status(400).json({ message: 'Insufficient stock' })
      return
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!cartItem || cartItem.cart.userId !== req.user!.id) {
      res.status(404).json({ message: 'Cart item not found' })
      return
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    })

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
