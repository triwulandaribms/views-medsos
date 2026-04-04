import { SocialData } from "@/src/types/social";

type CacheItem = {
  data: SocialData;
  expiry: number;
};

const cache = new Map<string, CacheItem>();

function getCache(key: string): SocialData | null {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

function setCache(key: string, data: SocialData, ttlMs: number) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

function mockInstagram(username: string): SocialData {
  return {
    platform: "Instagram",
    name: username,
    avatar: "https://via.placeholder.com/40",
    totalViews: 0,
    videos: [],
    isMock: true,
  };
}

export async function getInstagramData(username: string): Promise<SocialData> {

  const cacheKey = `instagram:${username}`;

  const cached = getCache(cacheKey);
  if (cached) {
    console.log("IG Cache HIT:", username);
    return cached;
  }

  try {

    const res = await fetch(
      "https://instagram120.p.rapidapi.com/api/instagram/posts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "instagram120.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPID_API_KEY!,
        },
        body: JSON.stringify({
          username: username,
        }),
      }
    );

    const json = await res.json();

    console.log("RAW RESPONSE:", JSON.stringify(json, null, 2));

    if (!res.ok) {
      console.error("API ERROR:", json);
      throw new Error("Failed fetch Instagram posts");
    }

   
    const posts =
      json?.data?.items ||
      json?.items ||
      json?.result?.items ||
      [];

    if (!Array.isArray(posts) || posts.length === 0) {
      console.warn("No posts found");
    }

    const totalViews = posts.reduce((sum: number, p: any) => {
      return (
        sum +
        (p.video_view_count ||
          p.play_count ||
          p.view_count ||
          p.like_count ||
          0)
      );
    }, 0);

  
    const videos = posts.slice(0, 5).map((p: any) => ({
      title:
        p.caption?.text ||
        p.caption ||
        p.title ||
        "Instagram Post",
      views:
        p.video_view_count ||
        p.play_count ||
        p.view_count ||
        p.like_count ||
        p.comment_count ||
        0,
    }));

   
    const avatar =
      posts[0]?.user?.profile_pic ||
      posts[0]?.user?.profile_pic_url ||
      "https://via.placeholder.com/40";

  
    const name =
      posts[0]?.user?.username ||
      username;

    const result: SocialData = {
      platform: "Instagram",
      name,
      avatar,
      totalViews,
      videos,
    };

    setCache(cacheKey, result, 5 * 60 * 1000); 

    return result;
  } catch (err) {
    console.error("Instagram ERROR:", err);

    return mockInstagram(username);
  }
}