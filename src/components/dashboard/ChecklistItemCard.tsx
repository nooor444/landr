'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  id: string
  title: string
  description: string
  category: string
  deadline_days: number
  official_link?: string | null
  onComplete: (id: string) => void
}

export default function ChecklistItemCard({
  id,
  title,
  description,
  category,
  deadline_days,
  official_link,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const urgencyLabel =
    deadline_days === 0
      ? { text: 'Do immediately', color: 'bg-red-100 text-red-700' }
      : deadline_days <= 10
      ? { text: `Within ${deadline_days} days`, color: 'bg-orange-100 text-orange-700' }
      : { text: `Within ${deadline_days} days`, color: 'bg-yellow-100 text-yellow-700' }

  const handleComplete = async () => {
    setLoading(true)
    await supabase
      .from('checklist_items')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
    onComplete(id)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {category}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyLabel.color}`}>
              {urgencyLabel.text}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 leading-snug">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      <div className="flex items-center justify-between gap-3 pt-1">
        {official_link ? (
          <a
            href={official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline"
          >
            Official link →
          </a>
        ) : (
          <span />
        )}
        <button
          onClick={handleComplete}
          disabled={loading}
          className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Saving…' : 'Mark Complete'}
        </button>
      </div>
    </div>
  )
}
