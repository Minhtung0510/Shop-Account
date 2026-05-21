# ShopAccount - Website bán tài khoản & dịch vụ Online

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animation**: Framer Motion
- **Database**: SQL Server + Prisma ORM
- **Auth**: NextAuth.js v5 (JWT + Google + Facebook OAuth)
- **Payment**: VietQR API
- **State**: Zustand (cart) + TanStack Query

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Edit .env với database URL và secrets của bạn
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

## Deployment lên Server Production

### 1. Chuẩn bị Server
- Thuê VPS (Ubuntu 20.04+) hoặc dùng Railway/Render
- Cài đặt Node.js 20+, SQL Server, Redis (optional)

### 2. Cấu hình Domain
- Point domain (ví dụ: `shopaccount.vn`) về IP server
- Cài SSL với Let's Encrypt:
```bash
sudo apt install certbot nginx
sudo certbot --nginx -d shopaccount.vn -d www.shopaccount.vn
```

### 3. Upload code & Setup .env
```bash
# Clone/pull code
git clone https://github.com/your-repo/shop-account.git
cd shop-account

# Copy và cấu hình .env.production
cp .env.production .env
nano .env  # Sửa các giá trị thực tế
```

### 4. Cấu hình quan trọng trong .env Production
```env
# DATABASE - Server thật
DATABASE_URL="sqlserver://USER:PASSWORD@localhost:1433/shop_account?encrypt=true&trustServerCertificate=true"

# AUTH - BẮT BUỘC phải đổi!
AUTH_SECRET="secret-mới-tạo-bằng-openssl-rand-base64-32"
NEXTAUTH_URL="https://shopaccount.vn"  # Domain thật

# EMAIL - Cấu hình SMTP thật
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@shopaccount.vn"

# WEBHOOKS - Cấu hình callback từ ngân hàng
BANKING_WEBHOOK_SECRET="secret-key-cho-webhook"
SEPAY_WEBHOOK_API_KEY="your-sepay-api-key"
```

### 5. Build & Start
```bash
npm install
npm run db:generate
npm run db:push
npm run build
npm start
```

### 6. Cấu hình PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start npm --name "shop-account" -- start
pm2 save
pm2 startup
```

### 7. Cấu hình Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/shop-account
server {
    listen 80;
    server_name shopaccount.vn www.shopaccount.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8. Hoặc dùng Docker (Đơn giản hơn)
```bash
# Tạo Dockerfile nếu chưa có
docker build -t shop-account .
docker run -d -p 3000:3000 --env-file .env shop-account
```

## Lưu ý quan trọng khi Deploy

| Item | Local | Production |
|------|-------|------------|
| DATABASE_URL | localhost:1433 | server-ip:1433 |
| AUTH_SECRET | test-secret | TẠO MỚI, dài 32+ ký tự |
| NEXTAUTH_URL | http://localhost:3000 | https://domain.com |
| SMTP | Test | Cấu hình thật |
| Webhooks | localhost | Cập nhật URL callback |

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
