import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@shopaccount.vn" },
    update: {},
    create: {
      email: "admin@shopaccount.vn",
      username: "admin",
      password: adminPassword,
      phone: "0901234567",
      role: "ADMIN",
      balance: 0,
      rank: "Admin",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await db.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      username: "nguyenvana",
      password: userPassword,
      phone: "0987654321",
      role: "USER",
      balance: 2500000,
      rank: "Gold",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Demo user created:", user.email);

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
  ]);
  console.log(`✅ ${categories.length} categories created`);

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
  ];

  for (const p of products) {
    const cat = categories.find((c) => c.slug === p.categorySlug)!;
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: `Tài khoản ${p.name} chất lượng cao, giao tự động ngay sau thanh toán.`,
        price: p.price,
        originalPrice: p.originalPrice || null,
        categoryId: cat.id,
        thumbnail: `https://picsum.photos/seed/${p.slug}/400/400`,
        images: [],
        stock: p.stock,
        rating: p.rating,
        sold: p.sold,
        warranty: "1 tháng",
        badge: p.badge as "BEST_SELLER" | "HOT" | "PREMIUM" | "NEW" | null,
        status: "ACTIVE",
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // Create services
  const services = [
    { name: "Khôi phục mật khẩu", slug: "khoi-phuc-mat-khau", icon: "🔑", description: "Hỗ trợ khôi phục mật khẩu tài khoản Facebook bị quên hoặc mất.", price: 50000, category: "Khôi phục" },
    { name: "Report tài khoản cá nhân", slug: "report-tai-khoan", icon: "🚫", description: "Report tài khoản Facebook vi phạm, spam, lừa đảo.", price: 30000, category: "Report" },
    { name: "Mở checkpoint", slug: "mo-checkpoint", icon: "🔓", description: "Dịch vụ mở checkpoint 72h cho tài khoản Facebook bị khóa.", price: 100000, category: "Mở khóa" },
    { name: "Mở khóa tài khoản", slug: "mo-khoa-tai-khoan", icon: "🛡️", description: "Mở khóa tài khoản Facebook bị vô hiệu hóa.", price: 150000, category: "Mở khóa" },
    { name: "Hỗ trợ BM", slug: "ho-tro-bm", icon: "⚙️", description: "Dịch vụ setup, quản lý Business Manager cho Facebook Ads.", price: 200000, category: "Hỗ trợ" },
  ];

  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log(`✅ ${services.length} services created`);

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
