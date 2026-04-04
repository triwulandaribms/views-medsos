'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SocialCard from '@/src/components/SocialCard'
import { SocialData } from '@/src/types/social'

export default function ResultClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const yt = searchParams.get('yt')
  const tt = searchParams.get('tt')
  const ig = searchParams.get('ig')

  const [data, setData] = useState<(SocialData | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const results = await Promise.allSettled([
        yt ? fetch(`/api/youtube?username=${yt}`).then(r => r.json()) : null,
        tt ? fetch(`/api/tiktok?username=${tt}`).then(r => r.json()) : null,
        ig ? fetch(`/api/instagram?username=${ig}`).then(r => r.json()) : null,
      ])

      const mapped = results.map((r: any) =>
        r.status === "fulfilled" && r.value?.success
          ? r.value.data
          : null
      )

      setData(mapped)
    } catch (error) {
      setError('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [yt, tt, ig])

  return (
    <main className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <button onClick={() => router.back()}>
          ← Back
        </button>

        <button onClick={fetchData}>
          Refresh
        </button>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && data.every(d => !d) && (
        <p>Tidak ada data yang ditemukan</p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {data.map((d, i) =>
          d ? <SocialCard key={i} data={d} /> : null
        )}
      </div>
    </main>
  )
}