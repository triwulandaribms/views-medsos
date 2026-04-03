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

function mockYoutube(username: string): SocialData {

  return {
    platform: "YouTube",
    name: username,
    avatar: "https://via.placeholder.com/40",
    totalViews: 1000000,
    videos: [
      { title: "Mock Video 1", views: 100000 },
      { title: "Mock Video 2", views: 90000 },
      { title: "Mock Video 3", views: 80000 },
      { title: "Mock Video 4", views: 70000 },
      { title: "Mock Video 5", views: 60000 },
    ],
    isMock: true,
  };
}

export async function getYoutubeData(username: string): Promise<SocialData> {

  try {

    const cacheKey = `youtube:${username}`;

    const cached = getCache(cacheKey);

    if (cached) {
      console.log("Cache HIT:", username);
      return cached;
    }
  
    // console.log("Cache MISS → hit API:", username);
   
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${username}&key=${process.env.API_KEY_YOUTUBE}`
    );

    const searchData = await searchRes.json();

    // console.log("ENV KEYYYY:", process.env.API_KEY_YOUTUBE);
    // console.log("CEKKKK SEARCH DATAAAA:", searchData);

    if (searchData.error) {
      if (searchData.error.message.includes("quota")) {
        console.warn("Quota api key kena limit/habis");
    
        const mock = mockYoutube(username);
    
        setCache(cacheKey, mock, 60 * 1000); 
    
        return mock;
      }
    
      throw new Error(searchData.error.message);
    }

    const channelId = searchData.items?.[0]?.id?.channelId;

    if (!channelId) {
      throw new Error("Channel not found");
    }

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${process.env.API_KEY_YOUTUBE}`
    );

    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=5&key=${process.env.API_KEY_YOUTUBE}`
    );

    const videoData = await videoRes.json();

    const ids = videoData.items
      ?.map((v: any) => v.id.videoId)
      .filter(Boolean)
      .join(",");

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${process.env.API_KEY_YOUTUBE}`
    );

    const stats = await statsRes.json();

    const result: SocialData = {
      platform: "YouTube",
      name: channel.snippet.title,
      avatar: channel.snippet.thumbnails.high.url,
      totalViews: Number(channel.statistics.viewCount),
      videos: (stats.items || []).map((v: any, i: number) => ({
        title: videoData.items?.[i]?.snippet?.title || "Untitled",
        views: Number(v.statistics?.viewCount || 0),
      })),
    };
    
    setCache(cacheKey, result, 5 * 60 * 1000);
    
    return result;

  } catch (error: any) {
    console.error("YouTube ERROR fallback:", error.message);

    return mockYoutube(username);
  }
}