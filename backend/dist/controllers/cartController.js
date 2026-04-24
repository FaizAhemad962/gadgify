"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart =
  exports.removeFromCart =
  exports.updateCartItem =
  exports.addToCart =
  exports.getCart =
    void 0;
const database_1 = __importDefault(require("../config/database"));
const getCart = async (req, res, next) => {
  try {
    let cart = await database_1.default.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { media: true },
            },
          },
        },
      },
    });
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await database_1.default.cart.create({
        data: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                include: { media: true },
              },
            },
          },
        },
      });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    // Check if product exists and has stock
    const product = await database_1.default.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (product.stock < quantity) {
      res.status(400).json({ message: "Insufficient stock" });
      return;
    }
    // Use transaction to handle concurrent add-to-cart requests safely
    const updatedCart = await database_1.default.$transaction(async (tx) => {
      // Get or create cart
      let cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }
      // Upsert cart item - this is atomic and handles concurrent requests
      const cartItem = await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        update: {
          quantity: {
            increment: quantity,
          },
        },
        create: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
      // Verify stock after potential quantity increase
      if (cartItem.quantity > product.stock) {
        throw new Error("Insufficient stock");
      }
      // Return updated cart
      return await tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                include: { media: true },
              },
            },
          },
        },
      });
    });
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cartItem = await database_1.default.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });
    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    if (cartItem.product.stock < quantity) {
      res.status(400).json({ message: "Insufficient stock" });
      return;
    }
    await database_1.default.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    const cart = await database_1.default.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    res.json(cart);
  } catch (error) {
    next(error);
  }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cartItem = await database_1.default.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    await database_1.default.cartItem.delete({ where: { id: itemId } });
    const cart = await database_1.default.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    res.json(cart);
  } catch (error) {
    next(error);
  }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res, next) => {
  try {
    const cart = await database_1.default.cart.findUnique({
      where: { userId: req.user.id },
    });
    if (cart) {
      await database_1.default.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
exports.clearCart = clearCart;
