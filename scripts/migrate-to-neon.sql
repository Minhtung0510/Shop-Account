-- =============================================================================
-- MIGRATION SCRIPT: SQL Server → PostgreSQL (Neon)
-- Generated from shop_account database
-- =============================================================================

-- XÓA TABLES CŨ (nếu cần reset)
DROP TABLE IF EXISTS "AccountInventory" CASCADE;
DROP TABLE IF EXISTS "CartItem" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "ServiceOrder" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "TopupTransaction" CASCADE;
DROP TABLE IF EXISTS "Warranty" CASCADE;
DROP TABLE IF EXISTS "WebhookLog" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Setting" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- =============================================================================
-- TẠO BẢNG ( Theo thứ tự để tránh vi phạm foreign key )
-- =============================================================================

-- 1. Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "icon" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
    "thumbnail" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "warranty" TEXT,
    "badge" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "phone" TEXT UNIQUE,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" TEXT NOT NULL DEFAULT 'Bronze',
    "emailVerified" TIMESTAMPTZ,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "twoFactorSecret" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "isLocked" BOOLEAN NOT NULL DEFAULT FALSE,
    "lockedAt" TIMESTAMPTZ
);

-- 4. Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expires" TIMESTAMPTZ NOT NULL
);

-- 5. Account (OAuth)
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    UNIQUE("provider", "providerAccountId")
);

-- 6. VerificationToken
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMPTZ NOT NULL,
    PRIMARY KEY("identifier", "token")
);

-- 7. Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'BALANCE',
    "transactionId" TEXT,
    "voucherCode" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "accountData" TEXT
);

-- 9. CartItem
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE("userId", "productId")
);

-- 10. AccountInventory
CREATE TABLE "AccountInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "orderId" TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Service
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ServiceOrder
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceSlug" TEXT NOT NULL DEFAULT '',
    "serviceIcon" TEXT NOT NULL DEFAULT '',
    "serviceDescription" TEXT NOT NULL DEFAULT '',
    "servicePrice" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- 13. TopupTransaction
CREATE TABLE "TopupTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "amount" DOUBLE PRECISION NOT NULL,
    "bankCode" TEXT NOT NULL,
    "transferContent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Setting
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL
);

-- 15. Warranty
CREATE TABLE "Warranty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "orderId" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. WebhookLog
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE("provider", "externalId")
);

-- =============================================================================
-- INSERT DỮ LIỆU ( Theo thứ tự để tránh vi phạm foreign key )
-- =============================================================================

-- Category (trước Product vì Product có foreign key đến Category)
INSERT INTO "Category" ("id", "name", "slug", "icon", "productCount", "createdAt", "updatedAt") VALUES
('cmpc1od0q0002t5zwfn8e7fz6', 'Canva', 'canva', '🎨', 64, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbf0003t5zw4udj7aqr', 'Facebook', 'facebook', '📘', 45, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbm0004t5zwq3cmdvs7', 'Netflix', 'netflix', '🎬', 128, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbo0005t5zw50uw516s', 'YouTube', 'youtube', '▶️', 42, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbr0006t5zw59p7yayq', 'Discord', 'discord', '🎮', 25, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbu0007t5zwdp34h91z', 'TikTok', 'tiktok', '🎵', 12, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbw0008t5zws9r2h09l', 'CapCut', 'capcut', '✂️', 20, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odby0009t5zw0i7m3lmq', 'Spotify', 'spotify', '🎵', 85, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odbz000at5zwk1ev92ud', 'Disney+', 'disney', '🏰', 38, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000'),
('cmpc1odc2000bt5zwqraiz2sz', 'ChatGPT', 'chatgpt', '🤖', 30, '2026-05-19T02:59:38.8590000', '2026-05-19T02:59:38.8590000');

-- Product
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "originalPrice", "categoryId", "thumbnail", "images", "stock", "rating", "sold", "warranty", "badge", "status", "createdAt", "updatedAt") VALUES
('cmpc1odc6000dt5zwwnl2ocre', 'Netflix Premium 1 tháng', 'netflix-premium-1-thang', 'Tai khoan Netflix Premium 1 tháng chat luong cao, giao tu dong ngay sau thanh toan.', 49000, 79000, 'cmpc1odbm0004t5zwq3cmdvs7', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', '[]', 0, 4.9, 15430, '1 thang', 'BEST_SELLER', 'ACTIVE', '2026-05-19T02:59:39.2700000', '2026-05-19T09:15:07.5320000'),
('cmpc1odci000ft5zwmuprowz2', 'Netflix Premium 3 tháng', 'netflix-premium-3-thang', 'Tai khoan Netflix Premium 3 thang chat luong cao, giao tu dong ngay sau thanh toan.', 120000, 180000, 'cmpc1odbm0004t5zwq3cmdvs7', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', '[]', 0, 4.9, 8502, '1 thang', 'HOT', 'ACTIVE', '2026-05-19T02:59:39.2820000', '2026-05-19T07:46:37.0940000'),
('cmpc1odcs000ht5zw1tgcm27g', 'Spotify Premium 1 năm', 'spotify-premium-1-nam', 'Tai khoan Spotify Premium 1 nam chat luong cao, giao tu dong ngay sau thanh toan.', 79000, 120000, 'cmpc1odby0009t5zw0i7m3lmq', 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', '[]', 84, 4.8, 9851, '1 thang', 'HOT', 'ACTIVE', '2026-05-19T02:59:39.2920000', '2026-05-19T06:29:38.9670000'),
('cmpc1odd2000jt5zw76z2wcgq', 'Spotify Family 1 tháng', 'spotify-family-1-thang', 'Tai khoan Spotify Family 1 thang chat luong cao, giao tu dong ngay sau thanh toan.', 69000, NULL, 'cmpc1odby0009t5zw0i7m3lmq', 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', '[]', 0, 4.8, 5602, '1 thang', NULL, 'ACTIVE', '2026-05-19T02:59:39.3020000', '2026-05-19T07:37:11.6060000'),
('cmpc1oddb000lt5zwsxf23i94', 'Canva Pro 1 năm', 'canva-pro-1-nam', 'Tai khoan Canva Pro 1 nam chat luong cao, giao tu dong ngay sau thanh toan.', 39000, NULL, 'cmpc1od0q0002t5zwfn8e7fz6', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg', '[]', 64, 4.7, 7230, '1 thang', 'BEST_SELLER', 'ACTIVE', '2026-05-19T02:59:39.3110000', '2026-05-19T03:41:11.3130000'),
('cmpc1odde000nt5zww2rx0n8h', 'YouTube Premium 6 tháng', 'youtube-premium-6-thang', 'Tai khoan YouTube Premium 6 thang chat luong cao, giao tu dong ngay sau thanh toan.', 89000, 149000, 'cmpc1odbo0005t5zw50uw516s', 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg', '[]', 41, 4.8, 5621, '1 thang', 'PREMIUM', 'ACTIVE', '2026-05-19T02:59:39.3140000', '2026-05-19T06:58:50.1950000'),
('cmpc1oddh000pt5zwjnm7sqg2', 'Discord Nitro 1 tháng', 'discord-nitro-1-thang', 'Tai khoan Discord Nitro 1 thang chat luong cao, giao tu dong ngay sau thanh toan.', 45000, NULL, 'cmpc1odbr0006t5zw59p7yayq', 'https://upload.wikimedia.org/wikipedia/en/9/98/Discord_logo.svg', '[]', 23, 4.5, 2102, '1 thang', 'NEW', 'ACTIVE', '2026-05-19T02:59:39.3170000', '2026-05-19T06:38:49.0880000'),
('cmpc1oddk000rt5zwdakyfplk', 'ChatGPT Plus 1 tháng', 'chatgpt-plus-1-thang', 'Tai khoan ChatGPT Plus 1 thang chat luong cao, giao tu dong ngay sau thanh toan.', 150000, 200000, 'cmpc1odc2000bt5zwqraiz2sz', 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', '[]', 0, 4.9, 4501, '1 thang', 'HOT', 'ACTIVE', '2026-05-19T02:59:39.3200000', '2026-05-19T14:11:57.4940000'),
('cmpc2o5lq000tt55karx0dky7', 'Disney+ Premium 1 tháng', 'disney-premium-1-thang', 'Tai khoan Disney+ Premium 1 thang chat luong cao, giao tu dong ngay sau thanh toan.', 59000, 99000, 'cmpc1odbz000at5zwk1ev92ud', 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', '[]', 38, 4.8, 6200, '1 thang', 'HOT', 'ACTIVE', '2026-05-19T03:27:28.8620000', '2026-05-19T03:41:11.3220000'),
('cmpc2o5me000vt55kpsmue92c', 'CapCut Pro 1 năm', 'capcut-pro-1-nam', 'Tai khoan CapCut Pro 1 nam chat luong cao, giao tu dong ngay sau thanh toan.', 35000, NULL, 'cmpc1odbw0008t5zws9r2h09l', 'https://images.unsplash.com/photo-1635776062043-223faf322554?w=400&h=400&fit=crop', '[]', 19, 4.6, 4101, '1 thang', 'NEW', 'ACTIVE', '2026-05-19T03:27:28.8860000', '2026-05-19T06:58:35.5070000');

-- User
INSERT INTO "User" ("id", "email", "username", "password", "phone", "avatar", "role", "balance", "rank", "emailVerified", "twoFactorEnabled", "twoFactorSecret", "createdAt", "updatedAt", "isLocked", "lockedAt") VALUES
('cmpc1ocrd0000t5zwqfuuoyfz', 'admin@shopaccount.vn', 'admin', '$2b$12$XLGwanNFd/fM5Hc9xVdSFOw42kKztcxDg.ghtpVS855bOhU1ZkAPu', '0901234567', NULL, 'ADMIN', 100000, 'Admin', '2026-05-19T02:59:38.3820000', FALSE, NULL, '2026-05-19T02:59:38.5210000', '2026-05-20T03:33:50.7120000', FALSE, NULL),
('cmpc1od0h0001t5zw44p2j3f9', 'user@example.com', 'nguyenvana', '$2b$12$7BZ6g4mzUqF0/H/rjYR3E.pqWjQUunqhlUUuU6WLMl5ZEhgmOipwG', '0987654321', NULL, 'USER', 2891000, 'Gold', '2026-05-19T02:59:38.8480000', FALSE, NULL, '2026-05-19T02:59:38.8490000', '2026-05-19T07:15:19.5710000', FALSE, NULL),
('cmpc48oy10003t54c30wgzdhz', 'user2@example.com', 'tùng nguyễn', '$2b$12$zswoqveesasPVPawas7IpeGrSBlYk.pSnDWBB4jMSthzFvH3dIs2m', '0123456789', NULL, 'USER', 0, 'Bronze', NULL, FALSE, NULL, '2026-05-19T04:11:26.6650000', '2026-05-19T04:54:22.9580000', FALSE, NULL),
('cmpcau9m4000at5lc34ys5kvv', 'duongvanbach1152@gmail.com', 'Bạch Dương', '$2b$12$0RBVRONuC56epKSpwH6rTOP8r9VANibdWQzrvqhqHEdrrggc7KIxq', '0937809305', NULL, 'USER', 284000, 'Bronze', NULL, FALSE, NULL, '2026-05-19T07:16:10.9240000', '2026-05-19T07:44:29.1060000', FALSE, NULL),
('cmpcbwf6l0004t590swl8pje5', 'tungnmph30979@fpt.edu.vn', 'Tung vip pro', '$2b$12$N5qRboHCEpwwATPkd4HbxO8zpzKH5hjdobpd8mRcwguwpIHOP9sXO', '0909090909', NULL, 'USER', 1850000, 'Bronze', NULL, FALSE, NULL, '2026-05-19T07:45:51.0700000', '2026-05-19T14:11:57.4760000', FALSE, NULL);

-- Order
INSERT INTO "Order" ("id", "userId", "totalAmount", "status", "paymentMethod", "transactionId", "voucherCode", "createdAt", "updatedAt") VALUES
('cmpceunxn0002t5j0hjohf5mu', 'cmpcbwf6l0004t590swl8pje5', 49000, 'SUCCESS', 'BALANCE', NULL, NULL, '2026-05-19T09:08:27.9470000', '2026-05-19T09:08:27.9470000'),
('cmpcf38760009t5j00lxgcx84', 'cmpcbwf6l0004t590swl8pje5', 49000, 'SUCCESS', 'BALANCE', NULL, NULL, '2026-05-19T09:15:07.4580000', '2026-05-19T09:20:07.7110000'),
('cmpcpoyh10001t594tsmf0z7o', 'cmpcbwf6l0004t590swl8pje5', 150000, 'SUCCESS', 'BALANCE', NULL, NULL, '2026-05-19T14:11:57.4430000', '2026-05-19T14:11:57.4430000');

-- OrderItem
INSERT INTO "OrderItem" ("id", "orderId", "productId", "quantity", "price", "accountData") VALUES
('cmpceunxn0004t5j0snw4slaq', 'cmpceunxn0002t5j0hjohf5mu', 'cmpc1odc6000dt5zwwnl2ocre', 1, 49000, '[{"email":"1","password":"1"}]'),
('cmpcf3876000bt5j0ddr8sskk', 'cmpcf38760009t5j00lxgcx84', 'cmpc1odc6000dt5zwwnl2ocre', 1, 49000, '[{"email":"1","password":"11"}]'),
('cmpcpoyh10003t594cf68b11m', 'cmpcpoyh10001t594tsmf0z7o', 'cmpc1oddk000rt5zwdakyfplk', 1, 150000, '[{"email":"1","password":"1"}]');

-- AccountInventory
INSERT INTO "AccountInventory" ("id", "productId", "email", "password", "status", "orderId", "createdAt", "updatedAt") VALUES
('cmpcasxlq0004t5lcdn40nv8n', 'cmpc1odc6000dt5zwwnl2ocre', '1', '1', 'SOLD', 'cmpcat5yk0007t5lc47gups8w', '2026-05-19T07:15:08.7030000', '2026-05-19T07:15:19.6150000'),
('cmpcasz6d0005t5lchu9wlgh1', 'cmpc1odc6000dt5zwwnl2ocre', '2', '2', 'SOLD', 'cmpcauw04000ct5lcf2bqzl0y', '2026-05-19T07:15:10.7410000', '2026-05-19T07:16:40.0090000');

-- Service
INSERT INTO "Service" ("id", "name", "slug", "icon", "description", "price", "category", "status", "createdAt", "updatedAt") VALUES
('cmpc1yj6b000st59safvfx8z8', 'Khôi phục mật khẩu Facebook', 'khoi-phuc-mat-khau-facebook', '🔑', 'Khôi phục mật khẩu Facebook nhanh chóng, an toàn.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.3950000', '2026-05-19T03:07:33.3950000'),
('cmpc1yj6l000tt59soe2hdp3v', 'Report tài khoản cá nhân Facebook', 'report-tai-khoan-ca-nhan-facebook', '🚫', 'Report tài khoản cá nhân Facebook nhanh chóng.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.4060000', '2026-05-19T03:07:33.4060000'),
('cmpc1yj6q000ut59sr9xt1p5l', 'Report Fanpage Facebook', 'report-fanpage-facebook', '📘', 'Report Fanpage Facebook hiệu quả.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.4100000', '2026-05-19T03:07:33.4100000'),
('cmpc1yj6u000vt59sqmnakkzf', 'Report bài viết Facebook', 'report-bai-viet-facebook', '📝', 'Report bài viết Facebook nhanh gọn.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.4140000', '2026-05-19T03:07:33.4140000'),
('cmpc1yj6y000wt59s4ma18vhf', 'Mở checkpoint Facebook', 'mo-checkpoint-facebook', '🔓', 'Mở checkpoint Facebook an toàn, không mất tài khoản.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.4190000', '2026-05-19T03:07:33.4190000'),
('cmpc1yj72000xt59soc13swbs', 'Mở khóa tài khoản Facebook', 'mo-khoa-tai-khoan-facebook', '🔐', 'Mở khóa tài khoản Facebook nhanh chóng.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.4230000', '2026-05-19T03:07:33.4230000'),
('cmpc1yj76000yt59ssv073fhf', 'Hỗ trợ BM Facebook', 'ho-tro-bm-facebook', '💼', 'Hỗ trợ quản lý Business Manager Facebook.', 500000, 'Facebook', 'ACTIVE', '2026-05-19T03:07:33.4260000', '2026-05-19T03:07:33.4260000'),
('cmpc1yj79000zt59saxpq60vh', 'Mở khóa TikTok', 'mo-khoa-tiktok', '🔓', 'Mở khóa tài khoản TikTok nhanh chóng.', 500000, 'TikTok', 'ACTIVE', '2026-05-19T03:07:33.4290000', '2026-05-19T03:07:33.4290000'),
('cmpc1yj7c0010t59s689d7y8a', 'Report TikTok', 'report-tiktok', '🚫', 'Report tài khoản TikTok hiệu quả.', 500000, 'TikTok', 'ACTIVE', '2026-05-19T03:07:33.4320000', '2026-05-19T03:07:33.4320000'),
('cmpc1yj7g0011t59s2swizfg7', 'Kháng nghị livestream TikTok', 'khang-nghi-livestream-tiktok', '📺', 'Kháng nghị livestream TikTok bị banned.', 500000, 'TikTok', 'ACTIVE', '2026-05-19T03:07:33.4360000', '2026-05-19T03:07:33.4360000'),
('cmpc1yj7k0012t59s9o96whof', 'Tích xanh Instagram', 'tich-xanh-instagram', '✅', 'Xin tích xanh (verified) Instagram uy tín.', 500000, 'Instagram', 'ACTIVE', '2026-05-19T03:07:33.4400000', '2026-05-19T03:07:33.4400000'),
('cmpc1yj7n0013t59sly9x60pw', 'Mở khóa Instagram', 'mo-khoa-instagram', '🔓', 'Mở khóa tài khoản Instagram nhanh chóng.', 500000, 'Instagram', 'ACTIVE', '2026-05-19T03:07:33.4440000', '2026-05-19T03:07:33.4440000');

-- ServiceOrder
INSERT INTO "ServiceOrder" ("id", "serviceId", "serviceName", "serviceSlug", "serviceIcon", "serviceDescription", "servicePrice", "phone", "telegram", "status", "createdAt", "updatedAt", "userId") VALUES
('cmpcevm4m0006t5j0phwtd861', 'cmpc1yj6q000ut59sr9xt1p5l', 'Report Fanpage Facebook', 'report-fanpage-facebook', '📘', 'Report Fanpage Facebook hiệu quả.', 500000, '0937809305', NULL, 'SUCCESS', '2026-05-19T09:09:12.2630000', '2026-05-19T09:14:37.4450000', 'cmpcbwf6l0004t590swl8pje5'),
('cmpcf85cb000dt5j0ccjw7d7q', 'cmpc1yj6q000ut59sr9xt1p5l', 'Report Fanpage Facebook', 'report-fanpage-facebook', '📘', 'Report Fanpage Facebook hiệu quả.', 500000, '0937809305', NULL, 'SUCCESS', '2026-05-19T09:18:57.0360000', '2026-05-19T09:19:58.4270000', 'cmpcbwf6l0004t590swl8pje5'),
('cmpcf9a4i000ft5j08vxgubc7', 'cmpc1yj6q000ut59sr9xt1p5l', 'Report Fanpage Facebook', 'report-fanpage-facebook', '📘', 'Report Fanpage Facebook hiệu quả.', 500000, '0937809305', NULL, 'SUCCESS', '2026-05-19T09:19:49.8910000', '2026-05-19T09:19:55.6240000', 'cmpcbwf6l0004t590swl8pje5'),
('cmpcfvp9m000it5j0r0rz79b0', 'cmpc1yj6q000ut59sr9xt1p5l', 'Report Fanpage Facebook', 'report-fanpage-facebook', '📘', 'Report Fanpage Facebook hiệu quả.', 500000, '0937809305', NULL, 'SUCCESS', '2026-05-19T09:37:15.9470000', '2026-05-19T09:41:45.6890000', 'cmpcbwf6l0004t590swl8pje5'),
('cmpcgdz7y000mt5j0zohvwspf', 'cmpc1yj72000xt59soc13swbs', 'Mở khóa tài khoản Facebook', 'mo-khoa-tai-khoan-facebook', '🔐', 'Mở khóa tài khoản Facebook nhanh chóng.', 500000, '0937809305', NULL, 'PENDING', '2026-05-19T09:51:28.6550000', '2026-05-19T09:51:28.6550000', 'cmpcbwf6l0004t590swl8pje5');

-- Setting
INSERT INTO "Setting" ("id", "key", "value") VALUES
('cmpcrqb0l0004t5x4971u9bhs', 'bank_name', 'TP Bank'),
('cmpcrqb2e0005t5x4c93qm522', 'bank_account_number', '07553046301'),
('cmpcrqb3f0006t5x47ja9ju43', 'bank_account_name', 'NGUYEN MINH TUNG'),
('cmpcrqb580007t5x423l571x7', 'bank_qr_image', ''),
('cmpcs0bs9000at5x4ibemuvlp', 'momo_account_number', '0937809305'),
('cmpcs0btu000bt5x48u06tfu6', 'momo_account_name', 'NGUYEN MINH TUNG'),
('cmpcs0buk000ct5x4xvdqdn8p', 'momo_qr_image', '');

-- TopupTransaction (lấy một số record đại diện)
INSERT INTO "TopupTransaction" ("id", "userId", "amount", "bankCode", "transferContent", "status", "verifiedAt", "createdAt", "updatedAt") VALUES
('cmpcc0vz5000dt590whsnmmo4', 'cmpcbwf6l0004t590swl8pje5', 2000000, 'VCB', 'NMl8pje5959455', 'APPROVED', '2026-05-19T07:53:09.3040000', '2026-05-19T07:49:19.4570000', '2026-05-19T07:53:09.3160000'),
('cmpcg8u0t000kt5j0x8k7mkwf', 'cmpcbwf6l0004t590swl8pje5', 2000000, 'VCB', 'NMl8pje5048636', 'APPROVED', '2026-05-19T09:47:34.5510000', '2026-05-19T09:47:28.6370000', '2026-05-19T09:47:34.5570000'),
('cmpcrnmy00001t5x483u8yfhq', 'cmpcbwf6l0004t590swl8pje5', 2000000, 'TCB', 'NMl8pje5215076', 'PENDING', NULL, '2026-05-19T15:06:55.0770000', '2026-05-19T15:06:55.0770000'),
('cmpcrpq7f0003t5x4di0lgmho', 'cmpcbwf6l0004t590swl8pje5', 2000000, 'TPB', 'NMl8pje5312617', 'PENDING', NULL, '2026-05-19T15:08:32.6190000', '2026-05-19T15:08:32.6190000'),
('cmpcrqhcx0009t5x4pqc94s1r', 'cmpcbwf6l0004t590swl8pje5', 100000, 'TPB', 'NMl8pje5347808', 'PENDING', NULL, '2026-05-19T15:09:07.8090000', '2026-05-19T15:09:07.8090000'),
('cmpcs0mo1000et5x4crwykeif', 'cmpcbwf6l0004t590swl8pje5', 500000, 'MOMO', 'NMl8pje5821248', 'PENDING', NULL, '2026-05-19T15:17:01.2500000', '2026-05-19T15:17:01.2500000'),
('cmpcua1ep000ut5x4o2ngyv0u', 'cmpc1ocrd0000t5zwqfuuoyfz', 100000, 'BANK', 'NMl8pje5180395', 'PENDING', NULL, '2026-05-19T16:20:19.4900000', '2026-05-19T16:20:19.4900000'),
('cmpdi8xzh0001t56spjf2gpgr', 'cmpc1ocrd0000t5zwqfuuoyfz', 100000, 'TP Bank', 'NAPTIEN6SPJF2GPGR', 'APPROVED', '2026-05-20T03:33:50.7080000', '2026-05-20T03:31:19.1770000', '2026-05-20T03:33:50.7120000');

-- WebhookLog
INSERT INTO "WebhookLog" ("id", "provider", "externalId", "createdAt") VALUES
('cmpdj86d80002t56schvrvj8n', 'sepay', '0', '2026-05-20T03:58:43.0040000');

-- =============================================================================
-- HOÀN TẤT
-- =============================================================================
SELECT 'Migration completed successfully!' AS status;
SELECT count(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public';
