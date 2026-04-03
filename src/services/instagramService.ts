import { SocialData } from "@/src/types/social";

type CacheItem = {
  data: SocialData;
  expiry: number;
}

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
    totalViews: 300000,
    videos: [
      { title: "Mock Post 1", views: 5000 },
      { title: "Mock Post 2", views: 4000 },
      { title: "Mock Post 3", views: 3000 },
      { title: "Mock Post 4", views: 2000 },
      { title: "Mock Post 5", views: 1000 },
    ],
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
    const headers = {
      "x-rapidapi-key": process.env.RAPID_API_KEY!,
      "x-rapidapi-host": "instagram-scraper2.p.rapidapi.com",
    };

    const userRes = await fetch(
      `https://instagram-scraper2.p.rapidapi.com/user_info?username=${username}`,
      { headers }
    );



    const userJson = await userRes.json();

    // console.log("CEKKKKK USER JSON:", userJson);

    if (!userRes.ok || !userJson?.data) {
      console.error("API ERROR:", userJson);
      throw new Error("Failed get user info");
    }
    const user = userJson.data;
    const userId = user.pk;

    const postRes = await fetch(
      `https://instagram-scraper2.p.rapidapi.com/user_feed?user_id=${userId}`,
      { headers }
    );

    const postJson = await postRes.json();


    // console.log("CEKKKKKKK POST API:", postJson);

    // console.log("POST RAW:", JSON.stringify(postJson, null, 2));

    if (!postRes.ok || !postJson?.data) {
      throw new Error("Failed get posts");
    }

    const posts = postJson?.data?.items || postJson?.items || [];

    const totalViews = posts.reduce((sum: number, p: any) => {
      return (
        sum +
        (p.video_view_count ||
          p.play_count ||
          p.like_count ||
          0)
      );
    }, 0);

    const result: SocialData = {
      platform: "Instagram",
      name: user.full_name || user.username,
      avatar:
        user.profile_pic_url ||
        user.hd_profile_pic_url_info?.url ||
        "https://via.placeholder.com/40",

      totalViews,


      videos: posts.slice(0, 5).map((p: any) => ({
        title:
          p.caption?.text?.slice(0, 50) ||
          "Instagram Post",

        views:
          p.video_view_count ||
          p.play_count ||
          p.like_count ||
          p.comment_count ||
          0,
      })),

      stats: {
        followers: user.follower_count || 0,
        following: user.following_count || 0,
        videoCount: user.media_count || 0,
      },
    };

    setCache(cacheKey, result, 5 * 60 * 1000);

    return result;

  } catch (err) {

    console.error("Instagram ERROR fallback:", err);

    return mockInstagram(username);

  }
}