# Security Test Checklist - Shop-Account

> **Ngày tạo:** 2026-05-23  
> **Phiên bản:** 1.0  
> **Trạng thái:** Ready for Testing

---

## 1. Authentication & Authorization Tests

### 1.1 Login/Logout Flow

- [ ] **TC-AUTH-001:** Đăng nhập với thông tin hợp lệ → Đăng nhập thành công, chuyển hướng về trang chủ
- [ ] **TC-AUTH-002:** Đăng nhập với email không tồn tại → Hiển thị lỗi "Tài khoản không tồn tại"
- [ ] **TC-AUTH-003:** Đăng nhập với mật khẩu sai → Hiển thị lỗi "Sai mật khẩu"
- [ ] **TC-AUTH-004:** Đăng nhập với OAuth (Google) → Chuyển hướng sang Google Auth
- [ ] **TC-AUTH-005:** Đăng nhập nhiều lần thất bại → Tài khoản bị khóa tạm thời
- [ ] **TC-AUTH-006:** Logout → Session bị xóa, chuyển hướng về trang login
- [ ] **TC-AUTH-007:** Sau khi logout, truy cập `/adm/*` → Chuyển hướng về `/login`
- [ ] **TC-AUTH-008:** Token hết hạn → Tự động redirect về login

### 1.2 Role-Based Access Control (RBAC)

- [ ] **TC-RBAC-001:** USER đăng nhập → Chỉ thấy trang `/tai-khoan`, không thấy `/adm/*`
- [ ] **TC-RBAC-002:** ADMIN đăng nhập → Có quyền truy cập `/adm/*` (trừ `/adm/roles`)
- [ ] **TC-RBAC-003:** SUPER_ADMIN đăng nhập → Có quyền truy cập tất cả `/adm/*` bao gồm `/adm/roles`
- [ ] **TC-RBAC-004:** MODERATOR đăng nhập → Có quyền `/adm/don-hang`, `/adm/bao-hanh`
- [ ] **TC-RBAC-005:** STAFF đăng nhập → Chỉ thấy các trang được phép (products, categories, orders - read only)

### 1.3 Unauthorized Access Attempts

- [ ] **TC-UNAUTH-001:** USER thử truy cập `/adm/products` → Redirect về `/` với `?unauthorized=1`
- [ ] **TC-UNAUTH-002:** USER thử gọi API `/api/admin/products` → Response 403 Forbidden
- [ ] **TC-UNAUTH-003:** Không đăng nhập thử gọi API `/api/orders/[id]` → Response 401 Unauthorized
- [ ] **TC-UNAUTH-004:** USER thử truy cập `/adm/roles` → 403 Forbidden hoặc redirect
- [ ] **TC-UNAUTH-005:** Thử truy cập đơn hàng của user khác → 403 Forbidden

### 1.4 Session Management

- [ ] **TC-SESSION-001:** Mở tab ẩn danh, đăng nhập → Session hoạt động riêng biệt
- [ ] **TC-SESSION-002:** Đăng nhập từ thiết bị khác → Cả hai session đều hoạt động
- [ ] **TC-SESSION-003:** Xóa cookies JWT → Bị đăng xuất ngay lập tức
- [ ] **TC-SESSION-004:** Sửa đổi JWT token (fake) → Request bị reject

---

## 2. Critical Security Fixes Testing

### 2.1 C1: Auth Bypass - Orders/[id] (FIXED)

> **Mô tả:** Trước đây, bất kỳ ai có order ID đều có thể xem chi tiết đơn hàng. Đã fix bằng cách kiểm tra `order.userId === session.user.id` hoặc `ADMIN/SUPER_ADMIN`.

**Test Cases:**

- [ ] **TC-C1-001:** USER A đăng nhập, tạo đơn hàng Order-X → Có thể xem Order-X
- [ ] **TC-C1-002:** USER A thử xem Order của USER B (không phải đơn của mình) → 403 Forbidden
- [ ] **TC-C1-003:** ADMIN đăng nhập, thử xem Order của bất kỳ user nào → 200 OK
- [ ] **TC-C1-004:** SUPER_ADMIN đăng nhập, thử xem Order của bất kỳ user nào → 200 OK
- [ ] **TC-C1-005:** Không đăng nhập thử xem Order → 401 Unauthorized
- [ ] **TC-C1-006:** Thử truy cập `/api/orders/999999` (ID không tồn tại) → 404 Not Found

**Test Command:**
```bash
# Test với valid order ID của user khác
curl -X GET "http://localhost:3000/api/orders/[ORDER_ID_CUA_USER_KHAC]" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
# Expected: 403 Forbidden
```

### 2.5 C5: Send Email Authentication (FIXED)

> **Mô tả:** Trước đây, endpoint `/api/send-email` có thể bị gọi bởi bất kỳ ai. Đã fix bằng `requireAdmin()`.

**Test Cases:**

- [ ] **TC-C5-001:** USER thử gọi POST `/api/send-email` → 403 Forbidden
- [ ] **TC-C5-002:** MODERATOR thử gọi POST `/api/send-email` → 403 Forbidden
- [ ] **TC-C5-003:** ADMIN thử gọi POST `/api/send-email` → 200 OK (hoặc success)
- [ ] **TC-C5-004:** SUPER_ADMIN thử gọi POST `/api/send-email` → 200 OK
- [ ] **TC-C5-005:** Không đăng nhập thử gọi → 401 Unauthorized
- [ ] **TC-C5-006:** Gửi email với địa chỉ email không hợp lệ (ví dụ: `test@`) → 400 Bad Request
- [ ] **TC-C5-007:** Gửi email với subject chứa newline (`\r\n`) → Header injection prevented, subject bị sanitize
- [ ] **TC-C5-008:** Gửi email với nội dung HTML quá lớn (>1MB) → 400 Bad Request

**Test Command:**
```bash
# Test với user thường (không có quyền)
curl -X POST "http://localhost:3000/api/send-email" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_TOKEN" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Hello</p>"}'
# Expected: 403 Forbidden

# Test với admin
curl -X POST "http://localhost:3000/api/send-email" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=ADMIN_TOKEN" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Hello</p>"}'
# Expected: 200 OK hoặc {"success":true}
```

### 2.6 C6: Webhook Bypass (FIXED)

> **Mô tả:** Trước đây, webhooks Casso/SePay không verify authentication. Đã fix bằng secret token verification.

#### 2.6.1 Casso Webhook

- [ ] **TC-C6-CASSO-001:** Gọi POST `/api/webhooks/casso` KHÔNG có token → 401 Unauthorized
- [ ] **TC-C6-CASSO-002:** Gọi POST `/api/webhooks/casso` với sai token → 401 Unauthorized
- [ ] **TC-C6-CASSO-003:** Gọi POST `/api/webhooks/casso` với `secure-token` đúng → 200 OK
- [ ] **TC-C6-CASSO-004:** Gọi POST `/api/webhooks/casso` với `x-casso-signature` đúng → 200 OK
- [ ] **TC-C6-CASSO-005:** Test duplicate transaction (cùng `id`) → Chỉ xử lý 1 lần (idempotent)
- [ ] **TC-C6-CASSO-006:** Test với amount = 0 hoặc âm → Bỏ qua transaction

**Test Command:**
```bash
# Test không có token
curl -X POST "http://localhost:3000/api/webhooks/casso" \
  -H "Content-Type: application/json" \
  -d '{"data":[{"id":12345,"description":"NAPTIEN abc123","amount":50000}]}'
# Expected: 401 Unauthorized

# Test với sai token
curl -X POST "http://localhost:3000/api/webhooks/casso" \
  -H "Content-Type: application/json" \
  -H "secure-token: WRONG_SECRET" \
  -d '{"data":[{"id":12345,"description":"NAPTIEN abc123","amount":50000}]}'
# Expected: 401 Unauthorized

# Test với đúng token
curl -X POST "http://localhost:3000/api/webhooks/casso" \
  -H "Content-Type: application/json" \
  -H "secure-token: $CASSO_WEBHOOK_SECRET" \
  -d '{"data":[{"id":12345,"description":"NAPTIEN abc123","amount":50000}]}'
# Expected: 200 OK
```

#### 2.6.2 SePay Webhook

- [ ] **TC-C6-SEPAY-001:** Gọi POST `/api/webhooks/sepay` KHÔNG có token → 401 Unauthorized
- [ ] **TC-C6-SEPAY-002:** Gọi POST `/api/webhooks/sepay` với sai API key → 401 Unauthorized
- [ ] **TC-C6-SEPAY-003:** Gọi POST `/api/webhooks/sepay` với `Authorization: Apikey CORRECT_KEY` → 200 OK
- [ ] **TC-C6-SEPAY-004:** Test duplicate transaction (cùng `id`) → Chỉ xử lý 1 lần
- [ ] **TC-C6-SEPAY-005:** Test với `transferType` = "out" (không phải "in") → 200 OK nhưng bỏ qua

**Test Command:**
```bash
# Test không có token
curl -X POST "http://localhost:3000/api/webhooks/sepay" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"content":"NAPTIEN abc123","transferAmount":50000,"transferType":"in"}'
# Expected: 401 Unauthorized

# Test với sai key
curl -X POST "http://localhost:3000/api/webhooks/sepay" \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey WRONG_KEY" \
  -d '{"id":12345,"content":"NAPTIEN abc123","transferAmount":50000,"transferType":"in"}'
# Expected: 401 Unauthorized

# Test với đúng key
curl -X POST "http://localhost:3000/api/webhooks/sepay" \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey $SEPAY_WEBHOOK_API_KEY" \
  -d '{"id":12345,"content":"NAPTIEN abc123","transferAmount":50000,"transferType":"in"}'
# Expected: 200 OK
```

### 2.7 C7: Privilege Escalation (FIXED)

> **Mô tả:** Trước đây, user có thể tự phong quyền SUPER_ADMIN hoặc thay đổi role của SUPER_ADMIN. Đã fix bằng nhiều lớp kiểm tra.

**Test Cases:**

- [ ] **TC-C7-001:** USER thử gọi PUT `/api/admin/users` để set role = "SUPER_ADMIN" → 403 Forbidden
- [ ] **TC-C7-002:** USER thử gọi PUT `/api/admin/users` để set role = "ADMIN" → 403 Forbidden
- [ ] **TC-C7-003:** ADMIN thử sửa SUPER_ADMIN user (set role/balance) → 403 Forbidden
- [ ] **TC-C7-004:** ADMIN thử assign SUPER_ADMIN role cho user khác → 403 Forbidden
- [ ] **TC-C7-005:** SUPER_ADMIN thử assign SUPER_ADMIN role cho user khác → 403 Forbidden
- [ ] **TC-C7-006:** SUPER_ADMIN thử tự phong mình làm SUPER_ADMIN → 403 Forbidden
- [ ] **TC-C7-007:** SUPER_ADMIN thử sửa thông tin của SUPER_ADMIN khác → 403 Forbidden
- [ ] **TC-C7-008:** SUPER_ADMIN thử xóa SUPER_ADMIN → 403 Forbidden
- [ ] **TC-C7-009:** USER thử xóa user khác → 403 Forbidden
- [ ] **TC-C7-010:** ADMIN xóa user thường → 200 OK (chỉ SUPER_ADMIN mới được xóa)
- [ ] **TC-C7-011:** Kiểm tra audit log ghi nhận attempt xâm phạm SUPER_ADMIN → Có log với action "BLOCKED_ATTEMPT"

**Test Command:**
```bash
# Test user thường thử phong quyền SUPER_ADMIN
curl -X PUT "http://localhost:3000/api/admin/users" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_TOKEN" \
  -d '{"userId":"TARGET_USER_ID","role":"SUPER_ADMIN"}'
# Expected: 403 Forbidden

# Test admin thử sửa SUPER_ADMIN
curl -X PUT "http://localhost:3000/api/admin/users" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=ADMIN_TOKEN" \
  -d '{"userId":"SUPER_ADMIN_USER_ID","role":"ADMIN"}'
# Expected: 403 Forbidden
# Message: "Không thể sửa đổi thông tin Super Admin"
```

### 2.8 C8: Password Change Bypass (FIXED)

> **Mô tả:** Trước đây, OAuth-only accounts (không có password) vẫn có thể đổi password. Đã fix bằng cách check `user.password` tồn tại.

**Test Cases:**

- [ ] **TC-C8-001:** User có password thử đổi mật khẩu với `currentPassword` đúng → 200 OK
- [ ] **TC-C8-002:** User có password thử đổi mật khẩu với `currentPassword` sai → 400 Bad Request
- [ ] **TC-C8-003:** User có password thử đổi với `newPassword` < 6 ký tự → 400 Bad Request
- [ ] **TC-C8-004:** OAuth user (không có password) thử đổi mật khẩu → 403 Forbidden
- [ ] **TC-C8-005:** Message: "Tài khoản OAuth không thể đổi mật khẩu trực tiếp..."
- [ ] **TC-C8-006:** Không đăng nhập thử đổi mật khẩu → 401 Unauthorized
- [ ] **TC-C8-007:** Thử gửi request không có `currentPassword` hoặc `newPassword` → 400 Bad Request

**Test Command:**
```bash
# Test OAuth user thử đổi password
curl -X PUT "http://localhost:3000/api/me/password" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=OAUTH_USER_TOKEN" \
  -d '{"currentPassword":"anypassword","newPassword":"newpassword123"}'
# Expected: 403 Forbidden
# Response: {"error":"Tài khoản OAuth không thể đổi mật khẩu trực tiếp..."}

# Test với currentPassword sai
curl -X PUT "http://localhost:3000/api/me/password" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_TOKEN" \
  -d '{"currentPassword":"WRONG_PASSWORD","newPassword":"newpassword123"}'
# Expected: 400 Bad Request
# Response: {"error":"Mật khẩu hiện tại không đúng"}
```

---

## 3. Input Validation Tests

### 3.1 XSS Prevention

- [ ] **TC-XSS-001:** Gửi HTML script tag trong username → Script không được execute
- [ ] **TC-XSS-002:** Gửi `<script>alert('XSS')</script>` trong search query → Input bị sanitize
- [ ] **TC-XSS-003:** Gửi `"><script>alert(1)</script>` trong email → Input bị reject hoặc sanitize
- [ ] **TC-XSS-004:** Gửi JavaScript event handlers trong product name → Không execute
- [ ] **TC-XSS-005:** Gửi data URI scheme trong input → Không được xử lý như code

### 3.2 SQL Injection

> **Lưu ý:** Dự án sử dụng Prisma ORM nên SQL injection được ngăn chặn ở mức ORM. Test để đảm bảo không có raw SQL.

- [ ] **TC-SQL-001:** Thử `'; DROP TABLE users; --` trong search parameter → Không có lỗi hoặc crash
- [ ] **TC-SQL-002:** Thử `1=1` trong userId parameter → Không trả về tất cả records
- [ ] **TC-SQL-003:** Thử `UNION SELECT` attack → Không có data leak
- [ ] **TC-SQL-004:** Thử `'; DELETE FROM orders WHERE '1'='1` → Không có data loss

### 3.3 Email Validation

- [ ] **TC-EMAIL-001:** Gửi email hợp lệ → Request được chấp nhận
- [ ] **TC-EMAIL-002:** Gửi email không có @ → Reject với 400
- [ ] **TC-EMAIL-003:** Gửi email không có domain → Reject với 400
- [ ] **TC-EMAIL-004:** Gửi email với space → Reject với 400
- [ ] **TC-EMAIL-005:** Gửi email với special characters → Reject hoặc sanitize

### 3.4 Price/Amount Manipulation

- [ ] **TC-PRICE-001:** Thử gửi price = 0 trong checkout → Reject
- [ ] **TC-PRICE-002:** Thử gửi price = -1 → Reject hoặc server sử dụng price từ DB
- [ ] **TC-PRICE-003:** Thử gửi price = 0.001 → Reject hoặc server làm tròn
- [ ] **TC-PRICE-004:** Thử gửi amount = 9999999999 → Reject (quá lớn)
- [ ] **TC-PRICE-005:** Verify server luôn lấy price từ DB, không tin client → Test bằng cách thử submit với giá khác

**Test Command:**
```bash
# Test checkout với price manipulation
curl -X POST "http://localhost:3000/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_TOKEN" \
  -d '{
    "items": [{
      "productId": "PRODUCT_ID",
      "quantity": 1,
      "price": 1  # Thử thay đổi price
    }]
  }'
# Expected: Server sử dụng price từ DB, không phải price từ request
```

---

## 4. API Endpoint Tests

### 4.1 Checkout Flow

- [ ] **TC-CHECKOUT-001:** Checkout thành công với đủ số dư → Balance được trừ đúng
- [ ] **TC-CHECKOUT-002:** Checkout với không đủ số dư → 402 Payment Required
- [ ] **TC-CHECKOUT-003:** Checkout với sản phẩm hết hàng → 400 Bad Request
- [ ] **TC-CHECKOUT-004:** Checkout với số lượng > stock → 400 Bad Request
- [ ] **TC-CHECKOUT-005:** Checkout không đăng nhập → 401 Unauthorized
- [ ] **TC-CHECKOUT-006:** Checkout với productId không tồn tại → 400 Bad Request
- [ ] **TC-CHECKOUT-007:** Race condition - đặt hàng cùng lúc với user khác → Stock không bị âm
- [ ] **TC-CHECKOUT-008:** Email confirmation được gửi sau checkout thành công

### 4.2 Order Management

- [ ] **TC-ORDER-001:** Xem danh sách orders của chính mình → Chỉ thấy orders của mình
- [ ] **TC-ORDER-002:** ADMIN xem tất cả orders → Thấy tất cả orders
- [ ] **TC-ORDER-003:** ADMIN cập nhật order status → Cập nhật thành công + audit log
- [ ] **TC-ORDER-004:** USER thử cập nhật order status → 403 Forbidden
- [ ] **TC-ORDER-005:** Xem chi tiết order không tồn tại → 404 Not Found

### 4.3 Admin Functions

#### Account Inventory
- [ ] **TC-ADM-ACCOUNT-001:** ADMIN tạo account inventory → Thành công
- [ ] **TC-ADM-ACCOUNT-002:** USER thử tạo account inventory → 403 Forbidden
- [ ] **TC-ADM-ACCOUNT-003:** Xem danh sách accounts → Password bị obfuscate (base64)
- [ ] **TC-ADM-ACCOUNT-004:** ADMIN xóa account có status = SOLD → 400 Bad Request
- [ ] **TC-ADM-ACCOUNT-005:** ADMIN xóa account có status = AVAILABLE → Thành công

#### User Management
- [ ] **TC-ADM-USER-001:** ADMIN xem danh sách users → Thành công
- [ ] **TC-ADM-USER-002:** ADMIN cập nhật user role → Thành công + audit log
- [ ] **TC-ADM-USER-003:** ADMIN khóa/mở khóa user → Thành công
- [ ] **TC-ADM-USER-004:** ADMIN cập nhật user balance → Thành công + audit log
- [ ] **TC-ADM-USER-005:** SUPER_ADMIN xóa user → Thành công + audit log
- [ ] **TC-ADM-USER-006:** ADMIN thử xóa user → 403 Forbidden

### 4.4 Webhook Verification

- [ ] **TC-WEBHOOK-001:** Webhook không có signature → 401
- [ ] **TC-WEBHOOK-002:** Webhook với signature sai → 401
- [ ] **TC-WEBHOOK-003:** Webhook với signature đúng + duplicate ID → Chỉ xử lý 1 lần
- [ ] **TC-WEBHOOK-004:** Webhook với amount âm → Bị reject hoặc bỏ qua
- [ ] **TC-WEBHOOK-005:** Webhook với malformed JSON → 400
- [ ] **TC-WEBHOOK-006:** Verify audit log được tạo khi webhook được gọi

---

## 5. Frontend Security Tests

### 5.1 Header & Authentication State

- [ ] **TC-FRONT-001:** Header hiển thị đúng user info khi đăng nhập
- [ ] **TC-FRONT-002:** Header hiển thị "Đăng nhập" khi chưa đăng nhập
- [ ] **TC-FRONT-003:** Đăng xuất → Header cập nhật state, hiển thị "Đăng nhập"

### 5.2 Protected Routes

- [ ] **TC-FRONT-002:** Truy cập `/adm` khi chưa đăng nhập → Redirect về `/login`
- [ ] **TC-FRONT-003:** Truy cập `/adm/products` khi là USER → Redirect về `/`
- [ ] **TC-FRONT-004:** Truy cập `/adm/roles` khi là ADMIN → Redirect về `/`
- [ ] **TC-FRONT-005:** Truy cập `/tai-khoan` khi chưa đăng nhập → Redirect về `/login`

### 5.3 CSRF Protection

> **Lưu ý:** Next.js App Router có built-in CSRF protection cho mutations. Test để xác nhận.

- [ ] **TC-CSRF-001:** Gửi request từ domain khác (curl/postman không có cookie) → Bị reject nếu cần session
- [ ] **TC-CSRF-002:** Gửi request với valid session cookie → Được chấp nhận

### 5.4 Sensitive Data Exposure

- [ ] **TC-FRONT-003:** Kiểm tra password không hiển thị trong UI (chỉ obfuscate trong API)
- [ ] **TC-FRONT-004:** Kiểm tra account credentials trong email không bị log ra console
- [ ] **TC-FRONT-005:** Kiểm tra sensitive data không có trong page source (client-side)

---

## 6. Security Headers & Infrastructure

### 6.1 Required Security Headers

- [ ] **TC-HEADERS-001:** Response có `X-Content-Type-Options: nosniff`
- [ ] **TC-HEADERS-002:** Response có `X-Frame-Options: DENY` hoặc `SAMEORIGIN`
- [ ] **TC-HEADERS-003:** Response có `X-XSS-Protection: 1; mode=block`
- [ ] **TC-HEADERS-004:** Response có `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] **TC-HEADERS-005:** Response có `Content-Security-Policy` (nếu có)

### 6.2 Environment Variables

- [ ] **TC-ENV-001:** `AUTH_SECRET` được set (không có giá trị mặc định)
- [ ] **TC-ENV-002:** `CASSO_WEBHOOK_SECRET` được set cho production
- [ ] **TC-ENV-003:** `SEPAY_WEBHOOK_API_KEY` được set cho production
- [ ] **TC-ENV-004:** Database credentials không hardcoded trong source code
- [ ] **TC-ENV-005:** API keys (Resend, Brevo) được set qua env vars

---

## 7. Audit & Logging

### 7.1 Audit Log Verification

- [ ] **TC-AUDIT-001:** Đăng nhập → Có audit log
- [ ] **TC-AUDIT-002:** Tạo/sửa/xóa user → Có audit log với action tương ứng
- [ ] **TC-AUDIT-003:** Cập nhật order → Có audit log
- [ ] **TC-AUDIT-004:** Thay đổi role → Có audit log với old/new values
- [ ] **TC-AUDIT-005:** BLOCKED_ATTEMPT khi thử xâm phạm SUPER_ADMIN → Có audit log
- [ ] **TC-AUDIT-006:** Webhook được gọi → Có log trong console/server

### 7.2 Log Content Security

- [ ] **TC-LOG-001:** Password không được log ở plaintext
- [ ] **TC-LOG-002:** Sensitive PII được mask trong logs
- [ ] **TC-LOG-003:** Error logs không expose stack trace trong production

---

## 8. Performance & Rate Limiting

### 8.1 Rate Limiting

- [ ] **TC-RATE-001:** Gọi login API 10 lần liên tiếp → Có thể bị rate limit
- [ ] **TC-RATE-002:** Gọi webhook 100 lần/giây → Không gây DoS
- [ ] **TC-RATE-003:** Checkout nhiều lần liên tiếp → Balance check hoạt động

---

## 9. Summary Report Template

### Test Results Summary

| Category | Total Tests | Passed | Failed | Not Tested |
|----------|-------------|--------|--------|------------|
| Authentication & Auth | 20 | 0 | 0 | 20 |
| Critical Fixes (C1, C5, C6, C7, C8) | 35 | 0 | 0 | 35 |
| Input Validation | 15 | 0 | 0 | 15 |
| API Endpoints | 20 | 0 | 0 | 20 |
| Frontend Security | 10 | 0 | 0 | 10 |
| Security Headers | 5 | 0 | 0 | 5 |
| Audit & Logging | 7 | 0 | 0 | 7 |
| Rate Limiting | 3 | 0 | 0 | 3 |
| **TOTAL** | **115** | **0** | **0** | **115** |

### Critical Issues Found

| ID | Severity | Description | Location | Status |
|----|----------|-------------|----------|--------|
| (none yet) | - | - | - | - |

### Recommendations

1. (Add recommendations after testing)

---

## Appendix: Test Commands Quick Reference

### Quick Auth Test
```bash
# Test login
curl -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test protected endpoint
curl -X GET "http://localhost:3000/api/orders" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Quick Webhook Test
```bash
# Test Casso webhook
curl -X POST "http://localhost:3000/api/webhooks/casso" \
  -H "Content-Type: application/json" \
  -H "secure-token: $CASSO_SECRET" \
  -d '{"data":[{"id":1,"description":"NAPTIEN abc","amount":50000}]}'

# Test SePay webhook
curl -X POST "http://localhost:3000/api/webhooks/sepay" \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey $SEPAY_KEY" \
  -d '{"id":1,"content":"NAPTIEN abc","transferAmount":50000,"transferType":"in"}'
```

---

> **Created:** 2026-05-23  
> **Last Updated:** 2026-05-23  
> **Version:** 1.0
