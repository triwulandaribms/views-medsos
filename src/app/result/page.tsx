import { Suspense } from 'react'
import ResultClient from './ResultClient'

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResultClient />
    </Suspense>
  )
}