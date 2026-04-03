'use client'

import { useState } from 'react';
import { FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function InputForm({ onSearch }: any) {
  const [yt, setYt] = useState('')
  const [tt, setTt] = useState('')
  const [ig, setIg] = useState('')

  const router = useRouter()



  return (

    <div className="flex flex-col gap-4 max-w-md mx-auto">

      <div className="flex items-center gap-6">
        <FaYoutube className="text-red-500" size={24} />
        <input
          className="border p-2 rounded w-full"
          placeholder="YouTube username"
          onChange={e => setYt(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-6">
        <FaTiktok className="text-black" size={24} />
        <input
          className="border p-2 rounded w-full"
          placeholder="TikTok username"
          onChange={e => setTt(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-6">
        <FaInstagram className="text-pink-500" size={24} />
        <input
          className="border p-2 rounded w-full"
          placeholder="Instagram username"
          onChange={e => setIg(e.target.value)}
        />
      </div>

      <button
        onClick={() => {
          router.push(
            `/result?yt=${yt}&tt=${tt}&ig=${ig}`
          )
        }}
        className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600 transition"
      >
        Cari
      </button>
    </div>
    
  )
}