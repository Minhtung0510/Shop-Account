# Hướng Dẫn Migrate Database: SQL Server → PostgreSQL

## Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 1          BƯỚC 2          BƯỚC 3          BƯỚC 4     │
│  ──────────      ──────────      ──────────       ──────────  │
│  Export từ       Tạo PostgreSQL   Push schema      Import dữ  │
│  SSMS (.sql)     Database mới     sang PostgreSQL  liệu CSV   │
│       │                │               │                │     │
│       ▼                ▼               ▼                ▼     │
│  ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐   │
│  │  SSMS  │  →   │ Supabase│  →   │ Prisma │  →   │ Postgres│   │
│  │ SQL DB │      │/Render  │      │ migrate│      │   DB   │   │
│  └────────┘      └────────┘      └────────┘      └────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Bước 1: Export Dữ Liệu Từ SSMS

### Cách 1: Export Schema + Data bằng "Generate Scripts"

1. **Mở SSMS** → Kết nối đến SQL Server của bạn
2. **Click chuột phải** vào database `shop_account`
3. Chọn **Tasks** → **Generate Scripts...**
4. Ở wizard:
   - **Select database**: Đảm bảo `shop_account` được chọn → Next
   - **Choose script options**:
     - Set `Script Data` = **True**
     - Set `Script CREATE DATABASE` = False
     - Set `Script DROP` = False
   - **Choose objects**: Chọn "Select specific database objects" → Chọn tất cả tables
   - **Output**: Chọn "Save to new query window" hoặc "Save to file"
5. **Lưu file** thành `shop_account_data.sql`

### Cách 2: Export từng bảng ra CSV

Nếu cách 1 gặp vấn đề, dùng cách này:

1. Mở SSMS → Mở **New Query**
2. Chạy query cho từng bảng:

```sql
-- Chạy từng cái
SELECT * FROM Category;
SELECT * FROM Product;
SELECT * FROM [User];
-- ... các bảng khác
```

3. **Click chuột phải** vào kết quả → **Save Results As** → CSV

---

## Bước 2: Tạo PostgreSQL Database (Miễn Phí)

### Tuỳ chọn A: Supabase (Khuyến nghị) ⭐

1. Vào [supabase.com](https://supabase.com)
2. Tạo project mới
3. Lấy thông tin kết nối:
   - **Host**: `db.[project-ref].supabase.co`
   - **Port**: 5432
   - **Database**: postgres
   - **User**: postgres
   - **Password**: [đặt khi tạo project]

### Tuỳ chọn B: Render

1. Vào [render.com](https://render.com)
2. Tạo **PostgreSQL** instance mới
3. Lấy **External Database URL**

### Tuỳ chọn C: Railway

1. Vào [railway.app](https://railway.app)
2. Tạo **New Project** → **PostgreSQL**
3. Lấy connection string

---

## Bước 3: Cập Nhật Cấu Hình Project

### 3.1. Cập nhật `.env.production`

```env
# PostgreSQL Connection String
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Ví dụ Supabase:
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

# Auth
AUTH_SECRET="your-secure-secret-key-at-least-32-chars"
NEXTAUTH_URL="https://your-domain.com"
```

### 3.2. Cập nhật `.env` (local)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
AUTH_SECRET="dev-secret-key-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Bước 4: Push Schema Lên PostgreSQL

### 4.1. Cài đặt PostgreSQL client (nếu cần)

```bash
# Windows: Tải pgAdmin hoặc psql
# https://www.postgresql.org/download/windows/

# Hoặc dùng Docker:
docker run -d --name postgres -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres
```

### 4.2. Generate Prisma Client

```bash
npm run db:generate
```

### 4.3. Push Schema

```bash
npm run db:push
```

**Lệnh này sẽ tạo tất cả tables trong PostgreSQL!**

### 4.4. Seed Dữ Liệu Mẫu

```bash
npm run db:seed
```

**Lệnh này sẽ tạo admin user và sample products.**

---

## Bước 5: Import Dữ Liệu Cũ (Tùy Chọn)

Nếu muốn giữ dữ liệu cũ từ SQL Server:

### 5.1. Convert SQL Script

Dùng tool như [SqlToPg](https://www.sqlitetopg.com/) hoặc chỉnh tay file `shop_account_data.sql`:

```sql
-- TRƯỚC (SQL Server)
INSERT INTO [User] ([Id], [Email], ...) VALUES (1, 'test@email.com', ...)

-- SAU (PostgreSQL)
INSERT INTO "User" ("id", "email", ...) VALUES ('cuid123', 'test@email.com', ...);
```

### 5.2. Import bằng psql

```bash
psql -h HOST -U USER -d DATABASE -f shop_account_data.sql
```

### 5.3. Import bằng pgAdmin

1. Mở pgAdmin → Kết nối PostgreSQL
2. Click chuột phải vào database → **Restore**
3. Chọn file backup → Restore

---

## Kiểm Tra Sau Migration

```bash
# Kết nối và kiểm tra
npm run db:studio
```

Mở trình duyệt → http://localhost:5555 để xem dữ liệu trong Prisma Studio.

---

## Xử Lý Lỗi Thường Gặp

### Lỗi: "relation does not exist"

→ Chạy `npm run db:push` để tạo bảng

### Lỗi: "authentication failed"

→ Kiểm tra DATABASE_URL trong .env

### Lỗi: "column does not exist"

→ Export lại schema từ SSMS và kiểm tra tên columns

### Lỗi: Prisma Client out of date

→ Chạy `npx prisma generate` sau khi thay đổi schema

---

## Lệnh Hữu Ích

```bash
# Xem database trong terminal
npm run db:studio

# Reset database (XÓA HẾT DỮ LIỆU!)
npx prisma db push --force-reset

# Tạo migration
npm run db:migrate

# Generate client
npm run db:generate
```
