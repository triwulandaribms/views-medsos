import { SocialData } from "@/src/types/social";
import { FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa';

export default function SocialCard({ data }: { data: SocialData }) {
  if (!data) return null;

  const getIcon = () => {
    switch (data.platform) {
      case 'YouTube':
        return <FaYoutube className="text-red-500" />;
      case 'TikTok':
        return <FaTiktok className="text-black" />;
      case 'Instagram':
        return <FaInstagram className="text-pink-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">

      <div className="flex items-center gap-3 mb-3">
        <img
          src={data.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />

        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className="font-semibold">
            {data.name}
          </h2>
        </div>
      </div>

      <p className="text-sm mb-2">
        <span className="font-semibold">Total Views:</span>{' '}
        {Number(data.totalViews).toLocaleString()}
      </p>


      <div className="mt-3">
  <p className="font-semibold mb-1">
    {data.videos.length > 0 ? "Latest Content" : "Account Stats"}
  </p>

  {data.videos.length > 0 ? (
    <ul className="space-y-1 text-sm">
      {data.videos.map((v, i) => (
        <li key={i} className="border-b pb-1">
          {v.title} —{" "}
          <span className="text-gray-600">
            {Number(v.views).toLocaleString()} views
          </span>
        </li>
      ))}
    </ul>
  ) : data.stats ? (
    <div className="text-sm space-y-1">
      <p>
        Followers —{" "}
        <span className="text-gray-600">
          {Number(data.stats.followers).toLocaleString()}
        </span>
      </p>
      <p>
        Following —{" "}
        <span className="text-gray-600">
          {Number(data.stats.following).toLocaleString()}
        </span>
      </p>
      <p>
        Likes —{" "}
        <span className="text-gray-600">
          {Number(data.stats.likes).toLocaleString()}
        </span>
      </p>
      <p>
        Total Videos —{" "}
        <span className="text-gray-600">
          {Number(data.stats.videoCount).toLocaleString()}
        </span>
      </p>
    </div>
  ) : (
    <p className="text-sm text-gray-500">
      No content available
    </p>
  )}
</div>

      {data.isMock && (
        <p className="text-xs text-yellow-500 mt-3">
          Using fallback data (API quota limit)
        </p>
      )}
    </div>
  );
}



