export interface Video {
  title: string;
  views: number;
}

export interface SocialData {
  platform: string;
  name: string;
  avatar: string;
  totalViews: number;
  videos: Video[];
  isMock?: boolean;

  stats?: {
    followers?: number;
    following?: number;
    likes?: number;
    videoCount?: number;
  };
}