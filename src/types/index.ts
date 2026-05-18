// Database Models
export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  balance: number;
  rank: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  thumbnail: string;
  images: string[];
  stock: number;
  rating: number;
  sold: number;
  warranty?: string;
  badge?: "BEST_SELLER" | "HOT" | "PREMIUM" | "NEW";
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  color?: string;
  fromPrice?: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentMethod: "BALANCE" | "QR_BANKING";
  transactionId?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  accountData?: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface TopupTransaction {
  id: string;
  userId: string;
  amount: number;
  bankCode: string;
  transferContent: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  price: number;
  category: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface TopupForm {
  amount: number;
  bankCode: string;
}

export interface CheckoutForm {
  voucherCode?: string;
}

// Stats Types (Admin)
export interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  ordersToday: number;
  systemBalance: number;
  revenueChange: number;
  usersChange: number;
  ordersChange: number;
}

export interface ChartData {
  date: string;
  value: number;
}
