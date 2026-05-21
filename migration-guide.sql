-- ============================================
-- MIGRATION GUIDE: SQL Server → PostgreSQL
-- ============================================

-- 1. CÁC THAY ĐỔI SYNTAX CHÍNH
-- ============================

-- IDENTITY (SQL Server) →SERIAL (PostgreSQL)
-- SQL Server:
--   Id INT IDENTITY(1,1) PRIMARY KEY
-- PostgreSQL:
--   Id SERIAL PRIMARY KEY

-- BIGINT IDENTITY → BIGSERIAL
-- SQL Server:
--   Id BIGINT IDENTITY(1,1) PRIMARY KEY
-- PostgreSQL:
--   Id BIGSERIAL PRIMARY KEY

-- DATETIME → TIMESTAMP
-- SQL Server: GETDATE(), GETUTCDATE()
-- PostgreSQL: NOW()

-- NVARCHAR → VARCHAR hoặc TEXT
-- SQL Server: NVARCHAR(MAX), NVARCHAR(255)
-- PostgreSQL: VARCHAR(255), TEXT

-- BIT → BOOLEAN
-- SQL Server: BIT DEFAULT 0
-- PostgreSQL: BOOLEAN DEFAULT false

-- TINYINT/SMALLINT/INT → INTEGER
-- PostgreSQL dùng INTEGER thay vì INT

-- 2. CHUYỂN ĐỔI CHO TỪNG TABLE
-- =============================

-- Bảng Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',  -- PostgreSQL sẽ tự tạo CUID
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "productCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng User
CREATE TABLE IF NOT EXISTS "User" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255),
    "phone" VARCHAR(50) UNIQUE,
    "avatar" TEXT,
    "role" VARCHAR(50) DEFAULT 'USER',
    "balance" DOUBLE PRECISION DEFAULT 0,
    "rank" VARCHAR(50) DEFAULT 'Bronze',
    "emailVerified" TIMESTAMP,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "isLocked" BOOLEAN DEFAULT false,
    "lockedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng Product
CREATE TABLE IF NOT EXISTS "Product" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "categoryId" VARCHAR(25) NOT NULL REFERENCES "Category"("id"),
    "thumbnail" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "stock" INTEGER DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "sold" INTEGER DEFAULT 0,
    "warranty" VARCHAR(255),
    "badge" VARCHAR(50),
    "status" VARCHAR(50) DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng Order
CREATE TABLE IF NOT EXISTS "Order" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id"),
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(50) DEFAULT 'BALANCE',
    "transactionId" VARCHAR(255),
    "voucherCode" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng OrderItem
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "orderId" VARCHAR(25) NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" VARCHAR(25) NOT NULL REFERENCES "Product"("id"),
    "quantity" INTEGER DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "accountData" TEXT
);

-- Bảng CartItem
CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" VARCHAR(25) NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "quantity" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("userId", "productId")
);

-- Bảng TopupTransaction
CREATE TABLE IF NOT EXISTS "TopupTransaction" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id"),
    "amount" DOUBLE PRECISION NOT NULL,
    "bankCode" VARCHAR(50) NOT NULL,
    "transferContent" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng Service
CREATE TABLE IF NOT EXISTS "Service" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng ServiceOrder
CREATE TABLE IF NOT EXISTS "ServiceOrder" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id"),
    "serviceId" VARCHAR(25) NOT NULL,
    "serviceName" VARCHAR(255) NOT NULL,
    "serviceSlug" VARCHAR(255) DEFAULT '',
    "serviceIcon" VARCHAR(50) DEFAULT '',
    "serviceDescription" TEXT DEFAULT '',
    "servicePrice" DOUBLE PRECISION NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "telegram" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng Warranty
CREATE TABLE IF NOT EXISTS "Warranty" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id"),
    "orderId" VARCHAR(25) NOT NULL,
    "orderType" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "issue" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng AccountInventory
CREATE TABLE IF NOT EXISTS "AccountInventory" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "productId" VARCHAR(25) NOT NULL REFERENCES "Product"("id"),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'AVAILABLE',
    "orderId" VARCHAR(25),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bảng Account (OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(255),
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    UNIQUE("provider", "providerAccountId")
);

-- Bảng Session
CREATE TABLE IF NOT EXISTS "Session" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(25) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expires" TIMESTAMP NOT NULL
);

-- Bảng VerificationToken
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    UNIQUE("identifier", "token")
);

-- Bảng Setting
CREATE TABLE IF NOT EXISTS "Setting" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "value" TEXT NOT NULL
);

-- Bảng WebhookLog
CREATE TABLE IF NOT EXISTS "WebhookLog" (
    "id" VARCHAR(25) PRIMARY KEY DEFAULT 'cuid()',
    "provider" VARCHAR(100) NOT NULL,
    "externalId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("provider", "externalId")
);

-- 3. CHỈ MỤC (INDEXES)
-- ====================
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS "CartItem_userId_idx" ON "CartItem"("userId");
CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");
CREATE INDEX IF NOT EXISTS "TopupTransaction_userId_idx" ON "TopupTransaction"("userId");
CREATE INDEX IF NOT EXISTS "ServiceOrder_userId_idx" ON "ServiceOrder"("userId");
CREATE INDEX IF NOT EXISTS "Warranty_userId_idx" ON "Warranty"("userId");
CREATE INDEX IF NOT EXISTS "AccountInventory_productId_status_idx" ON "AccountInventory"("productId", "status");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");
