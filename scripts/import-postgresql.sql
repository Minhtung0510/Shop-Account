-- ============================================
-- IMPORT DATA: CSV → PostgreSQL
-- ============================================
-- Chạy script này sau khi đã export từ SQL Server
-- và upload lên PostgreSQL
-- ============================================

-- Cấu hình PostgreSQL
-- psql -h your-host -U your-user -d your-database -f import.sql

-- 1. IMPORT CATEGORY (trước vì Product phụ thuộc)
\echo 'Importing Category...'
\copy "Category"("id", "name", "slug", "icon", "productCount", "createdAt", "updatedAt") 
FROM 'sqlserver-export/Category.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 2. IMPORT USER
\echo 'Importing User...'
\copy "User"("id", "email", "username", "password", "phone", "avatar", "role", "balance", "rank", "emailVerified", "twoFactorEnabled", "twoFactorSecret", "isLocked", "lockedAt", "createdAt", "updatedAt") 
FROM 'sqlserver-export/User.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 3. IMPORT PRODUCT
\echo 'Importing Product...'
\copy "Product"("id", "name", "slug", "description", "price", "originalPrice", "categoryId", "thumbnail", "images", "stock", "rating", "sold", "warranty", "badge", "status", "createdAt", "updatedAt") 
FROM 'sqlserver-export/Product.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 4. IMPORT ACCOUNT (OAuth)
\echo 'Importing Account...'
\copy "Account"("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") 
FROM 'sqlserver-export/Account.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 5. IMPORT SESSION
\echo 'Importing Session...'
\copy "Session"("id", "sessionToken", "userId", "expires") 
FROM 'sqlserver-export/Session.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 6. IMPORT VERIFICATIONTOKEN
\echo 'Importing VerificationToken...'
\copy "VerificationToken"("identifier", "token", "expires") 
FROM 'sqlserver-export/VerificationToken.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 7. IMPORT ORDER
\echo 'Importing Order...'
\copy "Order"("id", "userId", "totalAmount", "status", "paymentMethod", "transactionId", "voucherCode", "createdAt", "updatedAt") 
FROM 'sqlserver-export/Order.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 8. IMPORT ORDERITEM
\echo 'Importing OrderItem...'
\copy "OrderItem"("id", "orderId", "productId", "quantity", "price", "accountData") 
FROM 'sqlserver-export/OrderItem.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 9. IMPORT CARTITEM
\echo 'Importing CartItem...'
\copy "CartItem"("id", "userId", "productId", "quantity", "createdAt") 
FROM 'sqlserver-export/CartItem.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 10. IMPORT TOPUPTRANSACTION
\echo 'Importing TopupTransaction...'
\copy "TopupTransaction"("id", "userId", "amount", "bankCode", "transferContent", "status", "verifiedAt", "createdAt", "updatedAt") 
FROM 'sqlserver-export/TopupTransaction.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 11. IMPORT SERVICE
\echo 'Importing Service...'
\copy "Service"("id", "name", "slug", "icon", "description", "price", "category", "status", "createdAt", "updatedAt") 
FROM 'sqlserver-export/Service.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 12. IMPORT SERVICEORDER
\echo 'Importing ServiceOrder...'
\copy "ServiceOrder"("id", "userId", "serviceId", "serviceName", "serviceSlug", "serviceIcon", "serviceDescription", "servicePrice", "phone", "telegram", "status", "createdAt", "updatedAt") 
FROM 'sqlserver-export/ServiceOrder.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 13. IMPORT WARRANTY
\echo 'Importing Warranty...'
\copy "Warranty"("id", "userId", "orderId", "orderType", "productName", "issue", "status", "adminNote", "createdAt", "updatedAt") 
FROM 'sqlserver-export/Warranty.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 14. IMPORT ACCOUNTINVENTORY
\echo 'Importing AccountInventory...'
\copy "AccountInventory"("id", "productId", "email", "password", "status", "orderId", "createdAt", "updatedAt") 
FROM 'sqlserver-export/AccountInventory.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 15. IMPORT SETTING
\echo 'Importing Setting...'
\copy "Setting"("id", "key", "value") 
FROM 'sqlserver-export/Setting.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- 16. IMPORT WEBHOOKLOG
\echo 'Importing WebhookLog...'
\copy "WebhookLog"("id", "provider", "externalId", "createdAt") 
FROM 'sqlserver-export/WebhookLog.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

\echo 'Import hoàn tất!'
