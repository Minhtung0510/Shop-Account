import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting seed...");

  // =====================================
  // 1. CREATE TEST USERS
  // =====================================
  console.log("Creating test users...");

  const testUsers = [
    {
      email: "admin@shopaccount.vn",
      username: "admin",
      password: "Admin123@",
      phone: "0901234567",
      role: "ADMIN",
      balance: 10000000,
      rank: "Admin",
    },
    {
      email: "user@shopaccount.vn",
      username: "nguoimua",
      password: "User123@",
      phone: "0987654321",
      role: "USER",
      balance: 2500000,
      rank: "Gold",
    },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await db.user.upsert({
      where: { email: userData.email },
      update: {
        username: userData.username,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role,
        balance: userData.balance,
        rank: userData.rank,
      },
      create: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role,
        balance: userData.balance,
        rank: userData.rank,
        emailVerified: new Date(),
      },
    });
    console.log(`  - ${user.email} (${user.role}) - Password: ${userData.password}`);
  }
  console.log(`${testUsers.length} users seeded successfully!`);

  // Create categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "netflix" },
      update: {},
      create: { name: "Netflix", slug: "netflix", icon: "🎬", productCount: 128 },
    }),
    db.category.upsert({
      where: { slug: "spotify" },
      update: {},
      create: { name: "Spotify", slug: "spotify", icon: "🎵", productCount: 85 },
    }),
    db.category.upsert({
      where: { slug: "canva" },
      update: {},
      create: { name: "Canva", slug: "canva", icon: "🎨", productCount: 64 },
    }),
    db.category.upsert({
      where: { slug: "youtube" },
      update: {},
      create: { name: "YouTube", slug: "youtube", icon: "▶️", productCount: 42 },
    }),
    db.category.upsert({
      where: { slug: "discord" },
      update: {},
      create: { name: "Discord", slug: "discord", icon: "🎮", productCount: 25 },
    }),
    db.category.upsert({
      where: { slug: "chatgpt" },
      update: {},
      create: { name: "ChatGPT", slug: "chatgpt", icon: "🤖", productCount: 30 },
    }),
    db.category.upsert({
      where: { slug: "facebook" },
      update: {},
      create: { name: "Facebook", slug: "facebook", icon: "📘", productCount: 45 },
    }),
    db.category.upsert({
      where: { slug: "disney" },
      update: {},
      create: { name: "Disney+", slug: "disney", icon: "🏰", productCount: 38 },
    }),
    db.category.upsert({
      where: { slug: "capcut" },
      update: {},
      create: { name: "CapCut", slug: "capcut", icon: "✂️", productCount: 20 },
    }),
    db.category.upsert({
      where: { slug: "tiktok" },
      update: {},
      create: { name: "TikTok", slug: "tiktok", icon: "🎵", productCount: 12 },
    }),
    db.category.upsert({
      where: { slug: "instagram" },
      update: {},
      create: { name: "Instagram", slug: "instagram", icon: "📷", productCount: 8 },
    }),
  ]);
  console.log(`${categories.length} categories created`);

  // Create products
  const products = [
    { name: "Netflix Premium 1 tháng", slug: "netflix-premium-1-thang", price: 49000, originalPrice: 79000, categorySlug: "netflix", stock: 128, rating: 4.9, sold: 15420, badge: "BEST_SELLER" },
    { name: "Netflix Premium 3 tháng", slug: "netflix-premium-3-thang", price: 120000, originalPrice: 180000, categorySlug: "netflix", stock: 64, rating: 4.9, sold: 8500, badge: "HOT" },
    { name: "Spotify Premium 1 năm", slug: "spotify-premium-1-nam", price: 79000, originalPrice: 120000, categorySlug: "spotify", stock: 85, rating: 4.8, sold: 9850, badge: "HOT" },
    { name: "Spotify Family 1 tháng", slug: "spotify-family-1-thang", price: 69000, categorySlug: "spotify", stock: 42, rating: 4.8, sold: 5600, badge: null },
    { name: "Canva Pro 1 năm", slug: "canva-pro-1-nam", price: 39000, categorySlug: "canva", stock: 64, rating: 4.7, sold: 7230, badge: "BEST_SELLER" },
    { name: "YouTube Premium 6 tháng", slug: "youtube-premium-6-thang", price: 89000, originalPrice: 149000, categorySlug: "youtube", stock: 42, rating: 4.8, sold: 5620, badge: "PREMIUM" },
    { name: "Discord Nitro 1 tháng", slug: "discord-nitro-1-thang", price: 45000, categorySlug: "discord", stock: 25, rating: 4.5, sold: 2100, badge: "NEW" },
    { name: "ChatGPT Plus 1 tháng", slug: "chatgpt-plus-1-thang", price: 150000, originalPrice: 200000, categorySlug: "chatgpt", stock: 30, rating: 4.9, sold: 4500, badge: "HOT" },
    { name: "Disney+ Premium 1 tháng", slug: "disney-premium-1-thang", price: 59000, originalPrice: 99000, categorySlug: "disney", stock: 38, rating: 4.8, sold: 6200, badge: "HOT" },
    { name: "CapCut Pro 1 năm", slug: "capcut-pro-1-nam", price: 35000, categorySlug: "capcut", stock: 20, rating: 4.6, sold: 4100, badge: "NEW" },
    { name: "TikTok Premium 1 tháng", slug: "tiktok-premium-1-thang", price: 39000, categorySlug: "tiktok", stock: 12, rating: 4.7, sold: 3200, badge: "HOT" },
    { name: "TikTok Premium 3 tháng", slug: "tiktok-premium-3-thang", price: 99000, categorySlug: "tiktok", stock: 8, rating: 4.8, sold: 1800, badge: null },
    { name: "Instagram Followers 1000", slug: "instagram-followers-1000", price: 45000, categorySlug: "instagram", stock: 50, rating: 4.6, sold: 2500, badge: "BEST_SELLER" },
    { name: "Instagram Likes 5000", slug: "instagram-likes-5000", price: 35000, categorySlug: "instagram", stock: 50, rating: 4.5, sold: 1800, badge: null },
  ];

  const productImages: Record<string, string> = {
    "netflix-premium-1-thang": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "netflix-premium-3-thang": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "spotify-premium-1-nam": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "spotify-family-1-thang": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "canva-pro-1-nam": "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    "youtube-premium-6-thang": "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
    "discord-nitro-1-thang": "https://upload.wikimedia.org/wikipedia/commons/en/9/98/Discord_logo.svg",
    "chatgpt-plus-1-thang": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    "disney-premium-1-thang": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    "capcut-pro-1-nam": "https://images.unsplash.com/photo-1635776062043-223faf322554?w=400&h=400&fit=crop",
    "tiktok-premium-1-thang": "https://picsum.photos/seed/tiktok1/400/400",
    "tiktok-premium-3-thang": "https://picsum.photos/seed/tiktok2/400/400",
    "instagram-followers-1000": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    "instagram-likes-5000": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
  };

  for (const p of products) {
    const cat = categories.find((c: typeof categories[number]) => c.slug === p.categorySlug)!;
    await db.product.upsert({
      where: { slug: p.slug },
      update: { thumbnail: productImages[p.slug] || `https://picsum.photos/seed/${p.slug}/400/400` },
      create: {
        name: p.name,
        slug: p.slug,
        description: `Tài khoản ${p.name} chất lượng cao, giao tự động ngay sau thanh toán.`,
        price: p.price,
        originalPrice: p.originalPrice || null,
        categoryId: cat.id,
        thumbnail: productImages[p.slug] || `https://picsum.photos/seed/${p.slug}/400/400`,
        images: "[]",
        stock: p.stock,
        rating: p.rating,
        sold: p.sold,
        warranty: "1 thang",
        badge: p.badge || null,
        status: "ACTIVE",
      },
    });
  }
  console.log(`${products.length} products created`);

  // Create services
  const services = [
    { name: "Khôi phục mật khẩu Facebook", slug: "khoi-phuc-mat-khau-facebook", icon: "🔑", description: "Khôi phục mật khẩu Facebook nhanh chóng, an toàn.", price: 500000, category: "Facebook" },
    { name: "Report tài khoản cá nhân Facebook", slug: "report-tai-khoan-ca-nhan-facebook", icon: "🚫", description: "Report tài khoản cá nhân Facebook nhanh chóng.", price: 500000, category: "Facebook" },
    { name: "Report Fanpage Facebook", slug: "report-fanpage-facebook", icon: "📘", description: "Report Fanpage Facebook hiệu quả.", price: 500000, category: "Facebook" },
    { name: "Report bài viết Facebook", slug: "report-bai-viet-facebook", icon: "📝", description: "Report bài viết Facebook nhanh gọn.", price: 500000, category: "Facebook" },
    { name: "Mở checkpoint Facebook", slug: "mo-checkpoint-facebook", icon: "🔓", description: "Mở checkpoint Facebook an toàn, không mất tài khoản.", price: 500000, category: "Facebook" },
    { name: "Mở khóa tài khoản Facebook", slug: "mo-khoa-tai-khoan-facebook", icon: "🔐", description: "Mở khóa tài khoản Facebook nhanh chóng.", price: 500000, category: "Facebook" },
    { name: "Hỗ trợ BM Facebook", slug: "ho-tro-bm-facebook", icon: "💼", description: "Hỗ trợ quản lý Business Manager Facebook.", price: 500000, category: "Facebook" },
    { name: "Mở khóa TikTok", slug: "mo-khoa-tiktok", icon: "🔓", description: "Mở khóa tài khoản TikTok nhanh chóng.", price: 500000, category: "TikTok" },
    { name: "Report TikTok", slug: "report-tiktok", icon: "🚫", description: "Report tài khoản TikTok hiệu quả.", price: 500000, category: "TikTok" },
    { name: "Kháng nghị livestream TikTok", slug: "khang-nghi-livestream-tiktok", icon: "📺", description: "Kháng nghị livestream TikTok bị banned.", price: 500000, category: "TikTok" },
    { name: "Tăng view TikTok", slug: "tang-view-tiktok", icon: "👁️", description: "Tăng lượt xem video TikTok nhanh chóng.", price: 10000, category: "TikTok" },
    { name: "Tăng tim/chất như Like TikTok", slug: "tang-like-tiktok", icon: "❤️", description: "Tăng tim và chất như like video TikTok.", price: 15000, category: "TikTok" },
    { name: "Tăng follow TikTok", slug: "tang-follow-tiktok", icon: "👥", description: "Tăng người theo dõi TikTok chất lượng.", price: 50000, category: "TikTok" },
    { name: "Tích xanh Instagram", slug: "tich-xanh-instagram", icon: "✅", description: "Xin tích xanh (verified) Instagram uy tín.", price: 500000, category: "Instagram" },
    { name: "Mở khóa Instagram", slug: "mo-khoa-instagram", icon: "🔓", description: "Mở khóa tài khoản Instagram nhanh chóng.", price: 500000, category: "Instagram" },
    { name: "Tăng view/reel Instagram", slug: "tang-view-instagram", icon: "👁️", description: "Tăng lượt xem video/reel Instagram.", price: 10000, category: "Instagram" },
    { name: "Tăng like Instagram", slug: "tang-like-instagram", icon: "❤️", description: "Tăng lượt thích bài viết Instagram.", price: 15000, category: "Instagram" },
    { name: "Tăng follow Instagram", slug: "tang-follow-instagram", icon: "👥", description: "Tăng người theo dõi Instagram chất lượng.", price: 50000, category: "Instagram" },
  ];

  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log(`${services.length} services created`);

  // Create default settings
  const defaultSettings = [
    { key: "store_name", value: "ShopAccount" },
    { key: "store_email", value: "support@shopaccount.vn" },
    { key: "store_hotline", value: "0901 234 567" },
    { key: "bank_name", value: "Vietcombank" },
    { key: "bank_account_number", value: "1234567890" },
    { key: "bank_account_name", value: "SHOP ACCOUNT" },
    { key: "bank_qr_image", value: "" },
    { key: "telegram", value: "" },
    { key: "zalo", value: "" },
    { key: "facebook", value: "" },
    { key: "description", value: "Hệ thống bán tài khoản & dịch vụ online tự động." },
    { key: "keywords", value: "mua tai khoan, ban tai khoan online, netflix, spotify, canva pro" },
    { key: "facebook_pixel", value: "" },
    { key: "google_analytics", value: "" },
  ];

  for (const s of defaultSettings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`${defaultSettings.length} default settings created`);

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
