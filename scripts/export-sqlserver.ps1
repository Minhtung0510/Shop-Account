# ============================================
# EXPORT SCRIPT: SQL Server → PostgreSQL
# ============================================
# Chạy script này trong PowerShell để export 
# dữ liệu từ SQL Server thành file CSV
# ============================================

# Cấu hình kết nối SQL Server của bạn
$Server = "localhost"
$Database = "shop_account"
$Username = "sa"  # Thay đổi nếu dùng Windows Auth thì bỏ User/Password
$Password = "YourPassword"  # Thay đổi password của bạn

# Danh sách bảng cần export
$Tables = @(
    "Category",
    "User",
    "Product",
    "Account",
    "Session",
    "VerificationToken",
    "Order",
    "OrderItem",
    "CartItem",
    "TopupTransaction",
    "Service",
    "ServiceOrder",
    "Warranty",
    "AccountInventory",
    "Setting",
    "WebhookLog"
)

# Thư mục lưu file export
$ExportDir = ".\sqlserver-export"
if (!(Test-Path $ExportDir)) {
    New-Item -ItemType Directory -Path $ExportDir | Out-Null
}

Write-Host "Bắt đầu export dữ liệu từ SQL Server..." -ForegroundColor Green
Write-Host "Thư mục export: $ExportDir"
Write-Host ""

# Export từng bảng
foreach ($Table in $Tables) {
    Write-Host "Exporting table: $Table..." -NoNewline
    
    $OutputFile = "$ExportDir\$Table.csv"
    
    # Câu lệnh SQL với BCP hoặc Invoke-Sqlcmd
    $Query = "SELECT * FROM [$Table]"
    
    try {
        # Sử dụng bcp cho export nhanh
        bcp "$Query" queryout "$OutputFile" -c -t"," -T -S "$Server"
        
        if (Test-Path $OutputFile) {
            $FileSize = (Get-Item $OutputFile).Length
            Write-Host " [OK] ($FileSize bytes)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Export hoàn tất! Kiểm tra thư mục: $ExportDir" -ForegroundColor Green
Write-Host ""
Write-Host "Bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Tạo tài khoản PostgreSQL (Supabase/Render/Railway)" -ForegroundColor White
Write-Host "2. Upload các file CSV lên PostgreSQL" -ForegroundColor White
Write-Host "3. Hoặc dùng psql:\$ psql -h host -U user -d database -f import.sql"
