import { db } from "../src/lib/db";
import { randomUUID } from "crypto";

async function createProducts() {
  console.log("Creating TikTok and Instagram products...\n");

  // Get categories
  const tiktokCategory = await db.category.findUnique({ where: { slug: "tiktok" } });
  const instagramCategory = await db.category.findUnique({ where: { slug: "instagram" } });

  if (!tiktokCategory) {
    await db.category.create({
      data: {
        id: randomUUID(),
        name: "TikTok",
        slug: "tiktok",
        icon: "🎵",
        productCount: 2,
      },
    });
    console.log("Created category: TikTok");
  }

  if (!instagramCategory) {
    await db.category.create({
      data: {
        id: randomUUID(),
        name: "Instagram",
        slug: "instagram",
        icon: "📷",
        productCount: 2,
      },
    });
    console.log("Created category: Instagram");
  }

  // Get categories again after creation
  const tiktokCat = await db.category.findUnique({ where: { slug: "tiktok" } });
  const instagramCat = await db.category.findUnique({ where: { slug: "instagram" } });

  const products = [
    // TikTok
    {
      name: "TikTok Premium 1 tháng",
      slug: "tiktok-premium-1-thang",
      description: "Tài khoản TikTok Premium chất lượng cao, giao tự động ngay sau thanh toán.",
      price: 39000,
      originalPrice: 59000,
      categoryId: tiktokCat!.id,
      thumbnail: "https://picsum.photos/seed/tiktok1/400/400",
      images: "[]",
      stock: 12,
      rating: 4.7,
      sold: 3200,
      warranty: "1 tháng",
      badge: "HOT",
    },
    {
      name: "TikTok Premium 3 tháng",
      slug: "tiktok-premium-3-thang",
      description: "Tài khoản TikTok Premium 3 tháng, tiết kiệm chi phí hơn.",
      price: 99000,
      originalPrice: 149000,
      categoryId: tiktokCat!.id,
      thumbnail: "https://picsum.photos/seed/tiktok2/400/400",
      images: "[]",
      stock: 8,
      rating: 4.8,
      sold: 1800,
      warranty: "3 tháng",
      badge: null,
    },
    // Instagram
    {
      name: "Instagram Followers 1000",
      slug: "instagram-followers-1000",
      description: "Tăng 1000 followers Instagram chất lượng cao, không rụng.",
      price: 45000,
      originalPrice: 69000,
      categoryId: instagramCat!.id,
      thumbnail: "https://picsum.photos/seed/instagram1/400/400",
      images: "[]",
      stock: 50,
      rating: 4.6,
      sold: 2500,
      warranty: "1 tháng",
      badge: "BEST_SELLER",
    },
    {
      name: "Instagram Likes 5000",
      slug: "instagram-likes-5000",
      description: "Tăng 5000 likes bài viết Instagram chất lượng.",
      price: 35000,
      originalPrice: 55000,
      categoryId: instagramCat!.id,
      thumbnail: "https://picsum.photos/seed/instagram2/400/400",
      images: "[]",
      stock: 50,
      rating: 4.5,
      sold: 1800,
      warranty: "1 tháng",
      badge: null,
    },
  ];

  for (const product of products) {
    const existing = await db.product.findUnique({ where: { slug: product.slug } });
    if (!existing) {
      await db.product.create({
        data: { id: randomUUID(), ...product, status: "ACTIVE" },
      });
      console.log(`Created: ${product.name}`);
    } else {
      console.log(`Exists: ${product.name}`);
    }
  }

  // Update category product counts
  const tiktokCount = await db.product.count({ where: { categoryId: tiktokCat!.id } });
  const instagramCount = await db.product.count({ where: { categoryId: instagramCat!.id } });

  await db.category.update({ where: { id: tiktokCat!.id }, data: { productCount: tiktokCount } });
  await db.category.update({ where: { id: instagramCat!.id }, data: { productCount: instagramCount } });

  console.log(`\nUpdated TikTok category: ${tiktokCount} products`);
  console.log(`Updated Instagram category: ${instagramCount} products`);

  console.log("\nDone!");
  await db.$disconnect();
}

createProducts().catch(console.error);
