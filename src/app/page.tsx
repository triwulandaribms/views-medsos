'use client'

import InputForm from '@/src/components/InputForm';

export default function Home() {
  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
        Media Sosial 
      </h1>

      <InputForm />
    </main>
  )
}