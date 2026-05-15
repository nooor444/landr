'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateChecklistButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/generate-checklist', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate My Checklist'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
