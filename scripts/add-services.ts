import { db } from "../src/lib/db";
import { randomUUID } from "crypto";

const tiktokServices = [
  { name: "Tăng view TikTok", slug: "tang-view-tiktok", icon: "👁️", description: "Tăng lượt xem video TikTok nhanh chóng, an toàn.", price: 10000, category: "TikTok" },
  { name: "Tăng tim/chất như Like TikTok", slug: "tang-like-tiktok", icon: "❤️", description: "Tăng tim và chất như like video TikTok chất lượng.", price: 15000, category: "TikTok" },
  { name: "Tăng follow TikTok", slug: "tang-follow-tiktok", icon: "👥", description: "Tăng người theo dõi TikTok chất lượng cao.", price: 50000, category: "TikTok" },
];

const instagramServices = [
  { name: "Tăng view/reel Instagram", slug: "tang-view-instagram", icon: "👁️", description: "Tăng lượt xem video/reel Instagram nhanh chóng.", price: 10000, category: "Instagram" },
  { name: "Tăng like Instagram", slug: "tang-like-instagram", icon: "❤️", description: "Tăng lượt thích bài viết Instagram chất lượng.", price: 15000, category: "Instagram" },
  { name: "Tăng follow Instagram", slug: "tang-follow-instagram", icon: "👥", description: "Tăng người theo dõi Instagram chất lượng cao.", price: 50000, category: "Instagram" },
];

async function addServices() {
  console.log("Adding TikTok services...");
  for (const s of tiktokServices) {
    const existing = await db.service.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      await db.service.create({
        data: { id: randomUUID(), ...s, status: "ACTIVE" },
      });
      console.log("  Added:", s.name);
    } else {
      console.log("  Exists:", s.name);
    }
  }

  console.log("Adding Instagram services...");
  for (const s of instagramServices) {
    const existing = await db.service.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      await db.service.create({
        data: { id: randomUUID(), ...s, status: "ACTIVE" },
      });
      console.log("  Added:", s.name);
    } else {
      console.log("  Exists:", s.name);
    }
  }

  console.log("Done!");
  await db.$disconnect();
}

addServices().catch(console.error);
