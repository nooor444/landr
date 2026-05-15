'use client'

import { useState } from 'react'
import ChecklistItemCard from './ChecklistItemCard'

type ChecklistItem = {
  id: string
  title: string
  description: string
  category: string
  deadline_days: number
  official_link?: string | null
}

type Props = {
  initialItems: ChecklistItem[]
  totalCount: number
  completedCount: number
}

export default function DashboardClient({ initialItems, totalCount, completedCount }: Props) {
  const [items, setItems] = useState(initialItems)
  const [completed, setCompleted] = useState(completedCount)

  const handleComplete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    setCompleted(prev => prev + 1)
  }

  const remaining = totalCount - completed
  const progressPct = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0

  return (
    <>
      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-800">Your settlement progress</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {completed} of {totalCount} steps complete
            </p>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-xs text-gray-400 mt-2">{remaining} steps remaining</p>
        )}
        {remaining === 0 && totalCount > 0 && (
          <p className="text-xs text-emerald-500 mt-2 font-medium">All done! You&apos;re fully settled in.</p>
        )}
      </div>

      {/* Top 3 urgent items */}
      {items.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3 px-1">Most urgent right now</h2>
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <ChecklistItemCard
                key={item.id}
                {...item}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && totalCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-emerald-700 font-medium">No urgent items right now.</p>
          <p className="text-emerald-600 text-sm mt-1">Check your full checklist to see what&apos;s next.</p>
        </div>
      )}
    </>
  )
}
