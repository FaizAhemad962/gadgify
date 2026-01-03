import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AuthRequest } from '../middlewares/auth'
import Stripe from 'stripe'
import { config } from '../config'

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
})

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, total, shippingAddress } = req.body
    const userId = req.user!.id

    // Validate stock for all items
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        res.status(404).json({ message: `Product ${item.productId} not found` })
        return
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        })
        return
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        shippingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Clear cart
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    })

    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    // Check if user owns the order
    if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' })
      return
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
}

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order || order.userId !== req.user!.id) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    if (order.paymentStatus === 'COMPLETED') {
      res.status(400).json({ message: 'Order already paid' })
      return
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'inr',
      metadata: { orderId: order.id },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    next(error)
  }
}

export const confirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params
    const { paymentId } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    })

    if (!order || order.userId !== req.user!.id) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentId,
        status: 'PROCESSING',
      },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    })

    res.json(updatedOrder)
  } catch (error) {
    next(error)
  }
}

// Admin routes
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
}
