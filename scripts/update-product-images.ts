import { db } from "../src/lib/db";

async function updateProductImages() {
  console.log("Updating product images...\n");

  const imageMap: Record<string, string> = {
    // Netflix
    "netflix-premium-1-thang": "/images/netflix.png",
    "netflix-premium-3-thang": "/images/netflix.png",
    // Spotify
    "spotify-premium-1-nam": "/images/spotify.png",
    "spotify-family-1-thang": "/images/spotify.png",
    // Canva
    "canva-pro-1-nam": "/images/canva.jfif",
    // YouTube
    "youtube-premium-6-thang": "/images/youtube.png",
    // Discord
    "discord-nitro-1-thang": "/images/discord.png",
    // ChatGPT
    "chatgpt-plus-1-thang": "/images/chatgpt.png",
    // Disney
    "disney-premium-1-thang": "/images/disney.png",
    // CapCut
    "capcut-pro-1-nam": "/images/capcut.png",
    // TikTok - sử dụng placeholder vì chưa có ảnh
    "tiktok-premium-1-thang": "https://picsum.photos/seed/tiktok1/400/400",
    "tiktok-premium-3-thang": "https://picsum.photos/seed/tiktok2/400/400",
    // Instagram - sử dụng placeholder vì chưa có ảnh
    "instagram-followers-1000": "https://picsum.photos/seed/instagram1/400/400",
    "instagram-likes-5000": "https://picsum.photos/seed/instagram2/400/400",
  };

  for (const [slug, thumbnail] of Object.entries(imageMap)) {
    const product = await db.product.findUnique({ where: { slug } });
    if (product) {
      await db.product.update({
        where: { slug },
        data: { thumbnail },
      });
      console.log(`Updated: ${product.name} -> ${thumbnail}`);
    } else {
      console.log(`Not found: ${slug}`);
    }
  }

  console.log("\nDone!");
  await db.$disconnect();
}

updateProductImages().catch(console.error);
