export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN" | "DELIVERY_STAFF" | "SUPPORT_STAFF";
  state: string;
  city: string;
  address: string;
  pincode: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  type: "image" | "video";
  isPrimary: boolean;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  colors?: string;
  category: string;
  hsnNo?: string;
  gstPercentage?: number;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  totalRatings?: number;
  media: ProductMedia[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  userId: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentId?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  colors?: string;
  hsnNo?: string;
  gstPercentage?: number;
  media: { url: string; type: "image" | "video"; isPrimary?: boolean }[];
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  couponCode?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface PaymentIntent {
  clientSecret?: string;
  orderId: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  razorpayOrderId?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
