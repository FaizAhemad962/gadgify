import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AuthRequest } from '../middlewares/auth'
import { razorpayInstance } from '../config/razorpay'
import { config } from '../config'
import crypto from 'crypto'

// Helper function to parse shippingAddress JSON
const transformOrder = (order: any) => {
  if (!order) return order
  return {
    ...order,
    shippingAddress: typeof order.shippingAddress === 'string' 
      ? JSON.parse(order.shippingAddress) 
      : order.shippingAddress
  }
}

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, subtotal, shipping, total, shippingAddress } = req.body
    const userId = req.user!.id

    // Fetch all products
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]))

    // Validate stock for all items
    for (const item of items) {
      const product = productMap.get(item.productId)

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
        subtotal,
        shipping,
        total: subtotal + shipping,
        shippingAddress: JSON.stringify(shippingAddress),
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

    res.status(201).json(transformOrder(order))
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

    res.json(orders.map(transformOrder))
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

    res.json(transformOrder(order))
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

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.total * 100), // Amount in paise
      currency: 'INR',
      receipt: order.id,
      notes: {
        orderId: order.id,
        userId: req.user!.id,
      },
    })

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.razorpayKeyId,
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

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

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: 'Invalid payment signature' })
      return
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentId: razorpay_payment_id,
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

    res.json(transformOrder(updatedOrder))
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

    res.json(orders.map(transformOrder))
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

    res.json(transformOrder(order))
  } catch (error) {
    next(error)
  }
}
