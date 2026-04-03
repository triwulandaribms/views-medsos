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

function mockTikTok(username: string): SocialData {
  return {
    platform: "TikTok",
    name: username,
    avatar: "https://via.placeholder.com/40",
    totalViews: 500000,
    videos: [
      { title: "Mock TikTok 1", views: 10000 },
      { title: "Mock TikTok 2", views: 9000 },
      { title: "Mock TikTok 3", views: 8000 },
      { title: "Mock TikTok 4", views: 7000 },
      { title: "Mock TikTok 5", views: 6000 },
    ],
    isMock: true,
  };
}

export async function getTiktokData(username: string): Promise<SocialData> {


  const cacheKey = `tiktok:${username}`;


  const cached = getCache(cacheKey);
  if (cached) {
    console.log("Cache HIT:", username);
    return cached;
  }

  try {

    const res = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/user/info?unique_id=${username}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY!,
          "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com",
        },
      }
    );

    const json = await res.json();

    // console.log("STATUSSSS:", res.status);
    // console.log("RESPONSEEEEE:", json);

    const postsRes = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/user/posts?unique_id=${username}&count=5`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY!,
          "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com",
        },
      }
    );

    const postsJson = await postsRes.json();

    // console.log("POSTSSSSSSSS:", postsJson);

    const ambilVideos =
      postsJson?.data?.videos ||
      postsJson?.data?.aweme_list ||
      [];

      const videos = ambilVideos
      .slice(0, 5)
      .map((v: any) => ({
        title: v.desc || v.title || "No caption",
        views:
          v.playCount ||
          v.play_count ||
          v.stats?.playCount ||
          v.statistics?.play_count ||
          v.statistics?.playCount ||
          0,
      }));

    // console.log("POSTS STRUCTUREEEEE:", postsJson?.data);


    if (!res.ok || !json?.data) {
      if (json?.message?.toLowerCase().includes("limit") ||
        json?.message?.toLowerCase().includes("quota") ||
        res.status === 429) {

        console.warn("TikTok quota limit → fallback mock");

        const mock = mockTikTok(username);
        setCache(cacheKey, mock, 60 * 1000);
        return mock;
      }

      throw new Error("TikTok API failed");
    }


    const user = json.data.user;
    const stats = json.data.stats;


    const result: SocialData = {
      platform: "TikTok",
      name: user.nickname,
      avatar: user.avatarThumb,
      totalViews: stats.heartCount || 0,
      videos,

      stats: {
        followers: stats.followerCount || 0,
        following: stats.followingCount || 0,
        likes: stats.heartCount || 0,
        videoCount: stats.videoCount || 0,
      },
    };

    setCache(cacheKey, result, 5 * 60 * 1000);

    return result;

  } catch (err) {
    console.error("TikTok ERROR fallback:", err);

    const mock = mockTikTok(username);
    setCache(cacheKey, mock, 60 * 1000);

    return mock;
  }
}