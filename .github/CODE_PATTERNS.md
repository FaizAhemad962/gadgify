# Code Patterns & Examples - Gadgify

Reference guide for common patterns used in Gadgify. Use these as templates when adding new features.

## Frontend Patterns

### 1. Creating a Custom Hook

**File**: `frontend/src/hooks/useProductFetch.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { fetchProducts } from '../api/products';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
}

export const useProductFetch = (filters?: any) => {
  return useQuery<Product[], AxiosError>({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: true, // Control when query runs
  });
};
```

### 2. Creating an API Call Function

**File**: `frontend/src/api/products.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export const fetchProducts = async (filters?: any): Promise<Product[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/products`, {
    params: filters,
  });
  return data.data; // API returns { success, data, message }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`);
  return data.data;
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/admin/products`, product);
  return data.data;
};
```

### 3. Creating a React Component with Forms

**File**: `frontend/src/components/AddProductForm.tsx`

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, TextField, Alert } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../api/products';
import { useTranslation } from 'react-i18next';

// Validation schema
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const AddProductForm: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate product queries to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Show success message (toast - implement your toast service)
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 500 }}>
      {mutation.isError && (
        <Alert severity="error">{t('error.failedToCreateProduct')}</Alert>
      )}

      <TextField
        {...register('name')}
        label={t('product.name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        {...register('price', { valueAsNumber: true })}
        label={t('product.price')}
        type="number"
        error={!!errors.price}
        helperText={errors.price?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        {...register('stock', { valueAsNumber: true })}
        label={t('product.stock')}
        type="number"
        error={!!errors.stock}
        helperText={errors.stock?.message}
        fullWidth
        margin="normal"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isSubmitting}
      >
        {t('actions.create')}
      </Button>
    </Box>
  );
};
```

### 4. Creating a Data Table Component

**File**: `frontend/src/components/ProductsTable.tsx`

```typescript
import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useProductFetch } from '../hooks/useProductFetch';
import { useTranslation } from 'react-i18next';

export const ProductsTable: React.FC = () => {
  const { t } = useTranslation();
  const { data: products, isLoading, error } = useProductFetch();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: t('product.name'), width: 200 },
    { field: 'price', headerName: t('product.price'), width: 120 },
    { field: 'stock', headerName: t('product.stock'), width: 120 },
  ];

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{t('error.failedToLoadProducts')}</Alert>;

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={products || []}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
      />
    </Box>
  );
};
```

## Backend Patterns

### 1. Creating a Controller

**File**: `backend/src/controllers/productController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { badRequest, internalError, success } from '../utils/response';

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const products = await productService.getAllProducts({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
    });
    res.json(success(products, 'Products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      return badRequest(res, 'Product not found', 404);
    }
    res.json(success(product, 'Product fetched'));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(success(product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};
```

### 2. Creating a Service

**File**: `backend/src/services/productService.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export const getAllProducts = async (options: {
  page: number;
  limit: number;
  search?: string;
}) => {
  const { page, limit, search } = options;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
  });
};

export const createProduct = async (input: CreateProductInput) => {
  return prisma.product.create({
    data: input,
  });
};

export const updateProduct = async (
  id: string,
  input: Partial<CreateProductInput>
) => {
  return prisma.product.update({
    where: { id },
    data: input,
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id },
  });
};
```

### 3. Creating Validation Schema

**File**: `backend/src/validators/productValidator.ts`

```typescript
import Joi from 'joi';

export const createProduct = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
});

export const updateProduct = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  price: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
});

export const getProducts = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
});
```

### 4. Creating Route Handler

**File**: `backend/src/routes/products.ts`

```typescript
import express from 'express';
import * as productController from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validator';
import * as productValidator from '../validators/productValidator';

const router = express.Router();

// Public routes
router.get(
  '/',
  validateRequest(productValidator.getProducts, 'query'),
  productController.getAllProducts
);

router.get('/:id', productController.getProductById);

// Admin routes (require authentication and admin role)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateRequest(productValidator.createProduct),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateRequest(productValidator.updateProduct),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  productController.deleteProduct
);

export default router;
```

### 5. Creating Middleware

**File**: `backend/src/middlewares/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token; // or req.headers.authorization

    if (!token) {
      return unauthorized(res, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    unauthorized(res, 'Invalid token');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return forbidden(res, 'Insufficient permissions');
    }
    next();
  };
};
```

### 6. Error Handling

**File**: `backend/src/utils/response.ts`

```typescript
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  statusCode: number;
}

export const success = <T>(data: T, message: string = 'Success'): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    statusCode: 200,
  };
};

export const created = <T>(data: T, message: string = 'Created'): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    statusCode: 201,
  };
};

export const badRequest = (res: Response, message: string, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    message,
    statusCode,
  });
};

export const unauthorized = (res: Response, message: string = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    error: message,
    message,
    statusCode: 401,
  });
};

export const forbidden = (res: Response, message: string = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    error: message,
    message,
    statusCode: 403,
  });
};

export const notFound = (res: Response, message: string = 'Not Found') => {
  return res.status(404).json({
    success: false,
    error: message,
    message,
    statusCode: 404,
  });
};

export const internalError = (res: Response, message: string = 'Internal Server Error') => {
  return res.status(500).json({
    success: false,
    error: message,
    message,
    statusCode: 500,
  });
};
```

## Database Patterns

### 1. Creating a Prisma Model

**File**: `backend/prisma/schema.prisma`

```prisma
model Product {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(255)
  description String?
  price     Float
  stock     Int      @default(0)
  image_url String?
  category  String?

  // Relations
  cartItems CartItem[]
  orderItems OrderItem[]

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Indexes
  @@index([category])
  @@index([createdAt])
}

model Cart {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  items     CartItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId])
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId String
  product   Product  @relation(fields: [productId], references: [id])

  quantity  Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([cartId])
  @@index([productId])
}
```

### 2. Creating a Prisma Migration

```bash
# Make schema changes in schema.prisma

# Create migration
npx prisma migrate dev --name add_product_category

# Generate Prisma client
npx prisma generate
```

### 3. Database Query Patterns

**File**: `backend/src/services/orderService.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get order with related data
export const getOrderWithItems = async (orderId: string) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          state: true, // for Maharashtra validation
        },
      },
      payment: true,
    },
  });
};

// Transaction example (atomic operation)
export const createOrderFromCart = async (userId: string) => {
  return prisma.$transaction(async (tx) => {
    // Get cart
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate total
    const orderItems: any[] = [];
    let total = 0;

    for (const item of cart.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.stock < item.quantity) {
        throw new Error(`Product ${item.productId} out of stock`);
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      total += product.price * item.quantity;

      // Update stock
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        totalPrice: total,
        status: 'PENDING',
        orderItems: {
          createMany: {
            data: orderItems,
          },
        },
      },
    });

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
};
```

## i18n Patterns

### 1. Setting Up Translations

**File**: `frontend/src/i18n/config.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mr: { translation: mr },
    hi: { translation: hi },
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### 2. Translation Files

**File**: `frontend/src/i18n/locales/en.json`

```json
{
  "product": {
    "name": "Product Name",
    "price": "Price",
    "stock": "Stock",
    "addToCart": "Add to Cart"
  },
  "actions": {
    "create": "Create",
    "update": "Update",
    "delete": "Delete",
    "cancel": "Cancel",
    "save": "Save"
  },
  "error": {
    "failedToLoadProducts": "Failed to load products",
    "maharashtraOnly": "This service is only available in Maharashtra"
  }
}
```

## Testing Patterns

### 1. API Endpoint Test

**File**: `backend/tests/api/products.test.ts`

```typescript
import request from 'supertest';
import app from '../../src/server';

describe('Products API', () => {
  it('should fetch all products', async () => {
    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should create product (admin only)', async () => {
    const token = 'valid_admin_token'; // Get from auth

    const response = await request(app)
      .post('/api/admin/products')
      .set('Cookie', `token=${token}`)
      .send({
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeDefined();
  });
});
```

---

**Patterns Version**: 1.0
**Last Updated**: 2026-02-28
**Framework Versions**: React 19, Express 5, Prisma 5
