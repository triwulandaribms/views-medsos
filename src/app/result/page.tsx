'use client'


import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SocialCard from '@/src/components/SocialCard'
import { SocialData } from '@/src/types/social'


export default function ResultPage() {

  const searchParams = useSearchParams()

  const router = useRouter()

  const yt = searchParams.get('yt');
  const tt = searchParams.get('tt');
  const ig = searchParams.get('ig');

  const [data, setData] = useState<(SocialData | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {

    try {

      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        yt ? fetch(`/api/youtube?username=${yt}`).then(r => r.json()) : null,
        tt ? fetch(`/api/tiktok?username=${tt}`).then(r => r.json()) : null,
        ig ? fetch(`/api/instagram?username=${ig}`).then(r => r.json()) : null,
      ]);

      const mapped = results.map((r: any) =>
        r.status === "fulfilled" && r.value?.success
          ? r.value.data
          : null
      );

    setData(mapped);

    } catch (error) {
      setError('Gagal mengambil data');
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData()
  }, [yt, tt, ig])

  return (

    <main className="p-10 max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-5">
        
        <button
          onClick={() => router.back()}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          ← Back
        </button>

        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>

      </div>

      {error && (
        <p className="text-center text-red-500 mb-4">{error}</p>
      )}

      {loading && <p className="text-center">Loading...</p>}

      {!loading && data.every(d => !d) && (
        <p className="text-center text-gray-500">
          Tidak ada data yang ditemukan
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {data.map((d, i) => d ? 
          <SocialCard key={i} data={d} /> : null
        )}
      </div>

    </main>
  )
}


