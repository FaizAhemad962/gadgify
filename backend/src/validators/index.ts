import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string().min(10).required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().min(5).required(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

export const productSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(1).required(),
  stock: Joi.number().min(0).required(),
  media: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        type: Joi.string().valid("image", "video").required(),
        isPrimary: Joi.boolean().optional(),
      }),
    )
    .min(1)
    .required(),
  colors: Joi.string().optional().allow(""),
  category: Joi.string().min(2).required(),
  hsnNo: Joi.string().optional().allow(""),
  gstPercentage: Joi.number().min(0).max(100).optional(),
});

export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
});

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      }),
    )
    .min(1)
    .required(),
  subtotal: Joi.number().min(0).required(),
  shipping: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  couponCode: Joi.string().trim().max(50).optional().allow(null, ""),
  shippingAddress: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
  }).required(),
});

export const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional().allow(""),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).required(),
  phone: Joi.string().min(10).required(),
  city: Joi.string().required(),
  address: Joi.string().min(5).required(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export const validateCouponSchema = Joi.object({
  code: Joi.string().trim().min(1).max(50).required(),
  subtotal: Joi.number().min(0).required(),
});

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().min(2).max(50).required(),
  discountType: Joi.string().valid("PERCENTAGE", "FLAT").required(),
  discountValue: Joi.number().min(0.01).required(),
  minOrderAmount: Joi.number().min(0).optional().default(0),
  maxDiscount: Joi.number().min(0).optional().allow(null),
  usageLimit: Joi.number().integer().min(1).optional().allow(null),
  expiresAt: Joi.string().isoDate().optional().allow(null),
});

export const updateCouponSchema = Joi.object({
  discountType: Joi.string().valid("PERCENTAGE", "FLAT").optional(),
  discountValue: Joi.number().min(0.01).optional(),
  minOrderAmount: Joi.number().min(0).optional(),
  maxDiscount: Joi.number().min(0).optional().allow(null),
  usageLimit: Joi.number().integer().min(1).optional().allow(null),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.string().isoDate().optional().allow(null),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow("", null),
  icon: Joi.string().max(100).optional().allow("", null),
  sortOrder: Joi.number().integer().min(0).optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow("", null),
  icon: Joi.string().max(100).optional().allow("", null),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid("USER", "ADMIN", "SUPER_ADMIN", "DELIVERY_STAFF", "SUPPORT_STAFF")
    .required(),
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string().min(10).required(),
  role: Joi.string()
    .valid("USER", "ADMIN", "SUPER_ADMIN", "DELIVERY_STAFF", "SUPPORT_STAFF")
    .required(),
  state: Joi.string().optional().default("Maharashtra"),
  city: Joi.string().optional().allow(""),
  address: Joi.string().optional().allow(""),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .allow(""),
});

export const createAddressSchema = Joi.object({
  label: Joi.string().trim().max(50).optional().default("Home"),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().min(10).required(),
  address: Joi.string().min(5).required(),
  city: Joi.string().required(),
  state: Joi.string().optional().default("Maharashtra"),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  isDefault: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object({
  label: Joi.string().trim().max(50).optional(),
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().min(10).optional(),
  address: Joi.string().min(5).optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional(),
  isDefault: Joi.boolean().optional(),
});

// Role Change Permission Schemas
export const grantRoleChangePermissionSchema = Joi.object({
  email: Joi.string().email().required(),
  canRemovePermission: Joi.boolean().optional().default(false),
});

export const changeUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid("USER", "ADMIN", "SUPER_ADMIN", "DELIVERY_STAFF", "SUPPORT_STAFF")
    .required(),
});
