# Shop Account — Project Specification

## 1. Tổng quan

- **Tên dự án**: Shop Account (tên tạm)
- **Loại**: E-commerce / Thương mại điện tử
- **Mô tả**: Website bán hàng online cho thị trường Việt Nam, hỗ trợ thanh toán qua cổng VNPay/MoMo, quản lý tài khoản người dùng.
- **Đối tượng**: Người bán hàng online, người mua hàng online tại Việt Nam
- **MVP vs Hoàn chỉnh**: Sản phẩm hoàn chỉnh
- **Team**: 1 người (solo developer)
- **Timeline**: Dưới 1 tháng
- **Design**: Có Figma mockup sẵn

---

## 2. Tech Stack

| Layer | Công nghệ | Lý do |
|---|---|---|
| **Frontend** | Next.js 15 (App Router, TypeScript) | SSR/SSG mạnh, SEO tốt, developer experience tốt |
| **UI** | Tailwind CSS | Nhanh, responsive, dễ custom theo Figma |
| **Backend** | Next.js API Routes (Route Handlers) | Không cần server riêng, deploy đơn giản |
| **ORM** | Prisma 6 | Kết nối trực tiếp SQL Server, type-safe |
| **Database** | SQL Server (SQL Server Studio) | Có sẵn trên máy user |
| **Auth** | NextAuth.js v5 (Credentials + JWT) | Bảo mật cao, tự kiểm soát, không phụ thuộc bên thứ 3 |
| **Validation** | Zod | Type-safe validation cho API |
| **Payment** | VNPay / MoMo API | Thanh toán phổ biến tại Việt Nam |
| **State** | Zustand | Nhẹ, đơn giản, đủ cho e-commerce |
| **Deployment** | Chưa deploy (local development) | Ưu tiên tốc độ phát triển |

---

## 3. Database Schema (Prisma)

### Models

```
User
  - id: String (UUID)
  - email: String (unique)
  - password: String (bcrypt hashed)
  - name: String?
  - role: Enum (ADMIN, CUSTOMER)
  - createdAt: DateTime
  - updatedAt: DateTime
  - orders: Order[]
  - addresses: Address[]

Product
  - id: String (UUID)
  - name: String
  - description: String?
  - price: Decimal
  - stock: Int
  - images: String[]
  - categoryId: String
  - category: Category
  - orderItems: OrderItem[]
  - createdAt: DateTime
  - updatedAt: DateTime

Category
  - id: String (UUID)
  - name: String
  - slug: String (unique)
  - products: Product[]

Order
  - id: String (UUID)
  - userId: String
  - user: User
  - status: Enum (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
  - total: Decimal
  - items: OrderItem[]
  - shippingAddress: Address
  - paymentMethod: Enum (COD, VNPAY, MOMO)
  - paymentStatus: Enum (UNPAID, PAID, FAILED)
  - paymentId: String? (VNPay/MoMo transaction ID)
  - createdAt: DateTime
  - updatedAt: DateTime

OrderItem
  - id: String (UUID)
  - orderId: String
  - order: Order
  - productId: String
  - product: Product
  - quantity: Int
  - price: Decimal (price at time of order)

Address
  - id: String (UUID)
  - userId: String
  - user: User
  - fullName: String
  - phone: String
  - province: String
  - district: String
  - ward: String
  - detail: String
  - isDefault: Boolean
```

---

## 4. API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers (login/logout) |

### Products
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/products` | Danh sách sản phẩm (pagination, filter) |
| GET | `/api/products/[id]` | Chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm (Admin) |
| PUT | `/api/products/[id]` | Cập nhật sản phẩm (Admin) |
| DELETE | `/api/products/[id]` | Xóa sản phẩm (Admin) |

### Categories
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/categories` | Danh sách danh mục |
| POST | `/api/categories` | Tạo danh mục (Admin) |

### Orders
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/orders` | Danh sách đơn hàng (User/Admin) |
| GET | `/api/orders/[id]` | Chi tiết đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng |
| PUT | `/api/orders/[id]/status` | Cập nhật trạng thái (Admin) |

### Payment
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/payment/vnpay` | Tạo URL thanh toán VNPay |
| POST | `/api/payment/momo` | Tạo URL thanh toán MoMo |
| GET | `/api/payment/callback` | VNPay/MoMo IPN callback |
| GET | `/api/payment/return` | VNPay/MoMo return URL (redirect) |

### Address
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/addresses` | Danh sách địa chỉ user |
| POST | `/api/addresses` | Thêm địa chỉ |
| PUT | `/api/addresses/[id]` | Cập nhật địa chỉ |
| DELETE | `/api/addresses/[id]` | Xóa địa chỉ |

### User
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/user/profile` | Thông tin profile |
| PUT | `/api/user/profile` | Cập nhật profile |
| PUT | `/api/user/password` | Đổi mật khẩu |

---

## 5. Security Checklist

- [x] **HTTPS** — Bắt buộc khi deploy (Vercel/ Railway tự có)
- [x] **Authentication** — NextAuth với JWT + bcrypt password hashing
- [x] **Authorization** — Role-based (ADMIN / CUSTOMER), middleware bảo vệ routes
- [x] **Input Validation** — Zod schemas cho tất cả API inputs
- [x] **Rate Limiting** — Next.js Rate Limit middleware
- [x] **Secrets Management** — Environment variables cho DB, API keys
- [x] **CSRF Protection** — NextAuth built-in
- [x] **XSS Protection** — React's built-in escaping + CSP headers
- [x] **SQL Injection** — Prisma parameterized queries (ORM protection)
- [x] **Secure Cookies** — HTTP-only, Secure, SameSite flags

---

## 6. Architecture & Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/             # Customer shop routes
│   │   ├── page.tsx        # Homepage / Product listing
│   │   ├── product/[id]/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── orders/
│   ├── (admin)/            # Admin routes
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── categories/
│   ├── api/                # API Route Handlers
│   │   ├── auth/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── categories/
│   │   ├── addresses/
│   │   ├── user/
│   │   └── payment/
│   ├── layout.tsx
│   └── globals.css
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn/ui style)
│   ├── shop/               # Shop-specific components
│   ├── admin/              # Admin-specific components
│   └── auth/               # Auth components
├── lib/                    # Utilities
│   ├── db.ts               # Prisma client singleton
│   ├── auth.ts             # NextAuth config
│   ├── validators/         # Zod schemas
│   ├── payment/             # VNPay & MoMo integration
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts             # Seed data
└── middleware.ts            # Auth & admin route protection
```

---

## 7. Development Phases

### Phase 1: Setup + Auth + Database (Ngày 1-3)
- [ ] Initialize Next.js 15 project với TypeScript, Tailwind
- [ ] Setup Prisma với SQL Server
- [ ] Configure NextAuth v5 (Credentials provider)
- [ ] Implement register, login, logout flows
- [ ] Protect routes với middleware
- [ ] Seed database với sample data

### Phase 2: Product & Category (Ngày 3-6)
- [ ] CRUD Products (Admin)
- [ ] Product listing & search (Customer)
- [ ] Product detail page
- [ ] CRUD Categories (Admin)
- [ ] Category filtering

### Phase 3: Cart & Checkout (Ngày 7-10)
- [ ] Cart state với Zustand
- [ ] Cart UI (add, remove, update quantity)
- [ ] Address management
- [ ] Order creation flow
- [ ] Order confirmation

### Phase 4: Payment Integration (Ngày 11-15)
- [ ] VNPay integration
- [ ] MoMo integration
- [ ] Payment callback handling
- [ ] Order status update after payment
- [ ] Error handling & retry logic

### Phase 5: Polish & Admin Dashboard (Ngày 16-20)
- [ ] Admin dashboard (orders, stats)
- [ ] Order management (Admin)
- [ ] User profile page
- [ ] Order history
- [ ] Responsive design pass
- [ ] SEO optimization

### Phase 6: Security & Deployment (Ngày 21-25)
- [ ] Security audit & fixes
- [ ] Performance optimization
- [ ] Test & bug fixes
- [ ] Deployment setup

---

## 8. Payment Flow

### VNPay Flow
1. User chọn VNPay → Server tạo payment URL với checksum
2. User redirected to VNPay gateway
3. VNPay processes → redirects back to `/api/payment/vnpay/return`
4. Server verifies checksum → updates order status
5. VNPay sends IPN to `/api/payment/vnpay/callback`
6. Order status updated to PAID

### MoMo Flow
1. User chọn MoMo → Server tạo payment request
2. MoMo returns QR code or deep link
3. User completes payment in MoMo app
4. MoMo sends callback to server
5. Order status updated to PAID

---

## 9. Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5s |
| Time to Interactive (TTI) | < 3s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Lighthouse Performance Score | > 85 |
| API Response Time | < 200ms (p95) |

---

## 10. Design Reference

- **Figma mockup**: Đã có sẵn (user sẽ cung cấp link sau)
- **UI Style**: Clean, modern, Vietnamese-friendly
- **Color palette**: Sẽ extract từ Figma
- **Typography**: Sẽ extract từ Figma
- **Components**: Sẽ build theo design tokens từ Figma
