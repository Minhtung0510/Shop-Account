# ShopAccount - Website bán tài khoản & dịch vụ Online

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animation**: Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (JWT + Google + Facebook OAuth)
- **Payment**: VietQR API
- **State**: Zustand (cart) + TanStack Query
- **Deployment**: Vercel + Railway

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 3. Setup database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:seed     # Seed demo data
```

### 4. Run development server
```bash
npm run dev
```

### 5. Open browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopaccount.vn | admin123 |
| User | user@example.com | user123 |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Auth pages (login, register)
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   └── tai-khoan/      # Product pages
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── shared/         # Header, Footer, Sidebar, Cart
│   ├── providers/      # React Query, Auth providers
│   └── features/       # Feature-specific components
├── lib/                # Utils, DB client, Auth config
├── store/              # Zustand stores
├── types/              # TypeScript types
└── env/                # Environment validation
```

## Pages

- `/` - Trang chủ (Hero, Danh mục, FB Services)
- `/tai-khoan` - Danh sách sản phẩm
- `/tai-khoan/[slug]` - Chi tiết sản phẩm
- `/dich-vu-facebook` - Dịch vụ Facebook
- `/nap-tien` - Nạp tiền (QR VietQR)
- `/gio-hang` - Giỏ hàng
- `/lich-su` - Lịch sử đơn hàng
- `/cai-dat` - Trang cá nhân
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/thanh-toan-thanh-cong` - Thanh toán thành công
- `/admin` - Dashboard quản trị
- `/admin/nguoi-dung` - Quản lý người dùng
- `/admin/san-pham` - Quản lý sản phẩm
- `/admin/don-hang` - Quản lý đơn hàng
- `/admin/nap-tien` - Quản lý nạp tiền
- `/admin/dich-vu` - Quản lý dịch vụ
- `/admin/cai-dat` - Cài đặt hệ thống
