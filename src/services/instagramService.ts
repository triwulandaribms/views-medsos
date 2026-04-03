import { SocialData } from "@/src/types/social";

const cache = new Map<string, { data: SocialData; expiry: number }>();

function getCache(key: string) {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

function setCache(key: string, data: SocialData, ttl: number) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
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

  console.log("IG Cache MISS → hit API:", username);

  try {
    // =========================
    // STEP 1: GET USER INFO
    // =========================
    const userRes = await fetch(
      `https://instagram-scraper2.p.rapidapi.com/user_tagged?username=${username}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY!,
          "x-rapidapi-host": "instagram-scraper2.p.rapidapi.com",
        },
        redirect: "manual",
      }
    );
    
    const userJson = await userRes.json();
    
    const user =
      userJson?.data?.user ||
      userJson?.data ||
      userJson?.user ||
      null;
    
    if (!user || !user.pk) {
      console.error("USER JSON ERROR:", userJson);
      throw new Error("Failed get user info");
    }

    console.log("RAW USER RESPONSE:", JSON.stringify(userJson, null, 2));

    const userId = user.pk;

    // =========================
    // STEP 2: GET TAGGED POSTS
    // =========================
    const postRes = await fetch(
      `https://instagram-scraper2.p.rapidapi.com/user_tagged?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY!,
          "x-rapidapi-host": "instagram-scraper2.p.rapidapi.com",
        },
        redirect: "manual",
      }
    );

    const postJson = await postRes.json();
    console.log("USER:", user);
    console.log("POST JSON:", JSON.stringify(postJson, null, 2));

    console.log("API KEY:", process.env.RAPID_API_KEY);
    console.log("STATUS:", userRes.status);
    console.log("HEADERS:", Object.fromEntries(userRes.headers.entries()));

    if (!postRes.ok || !postJson?.data) {
      throw new Error("Failed get tagged posts");
    }

    const posts = postJson.data?.items || [];

    // =========================
    // MAPPING
    // =========================
    const result: SocialData = {
      platform: "Instagram",
      name: user.full_name || user.username,
      avatar: user.profile_pic_url,
      totalViews: posts.length,

      videos: posts.slice(0, 5).map((p: any) => ({
        title:
          p.caption?.text ||
          "Instagram Post",

        views:
          p.like_count ||
          p.play_count ||
          p.comment_count ||
          0,
      })),
    };

    setCache(cacheKey, result, 5 * 60 * 1000);

    return result;

  } catch (err) {
    console.error("Instagram ERROR fallback:", err);

    const mock = mockInstagram(username);
    setCache(cacheKey, mock, 60 * 1000);

    return mock;
  }
}