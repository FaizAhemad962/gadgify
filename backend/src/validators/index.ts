import Joi from 'joi'

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string().min(10).required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().min(5).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
})

export const productSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(1).required(),
  stock: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().required(),
  category: Joi.string().min(2).required(),
})

export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
})

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
})

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
  total: Joi.number().min(0).required(),
  shippingAddress: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
  }).required(),
})
