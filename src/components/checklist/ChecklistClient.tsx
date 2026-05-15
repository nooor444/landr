'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = {
  id: string
  title: string
  description: string
  category: string
  priority: number
  is_completed: boolean
  completed_at: string | null
  official_link: string | null
  deadline_days: number
}

type Filter = 'all' | 'urgent' | 'upcoming' | 'completed'

type Props = {
  items: Item[]
  totalCount: number
  completedCount: number
}

function urgencyBadge(deadline_days: number) {
  if (deadline_days === 0)
    return { text: 'Do immediately', color: 'bg-red-100 text-red-700' }
  if (deadline_days <= 7)
    return { text: `Within ${deadline_days} days`, color: 'bg-orange-100 text-orange-700' }
  return { text: `Within ${deadline_days} days`, color: 'bg-yellow-100 text-yellow-700' }
}

export default function ChecklistClient({ items, totalCount, completedCount }: Props) {
  const [allItems, setAllItems] = useState<Item[]>(items)
  const [completed, setCompleted] = useState(completedCount)
  const [filter, setFilter] = useState<Filter>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  const markComplete = async (id: string) => {
    setLoadingId(id)
    await supabase
      .from('checklist_items')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
    setAllItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, is_completed: true, completed_at: new Date().toISOString() }
          : item
      )
    )
    setCompleted((c) => c + 1)
    setLoadingId(null)
  }

  const markIncomplete = async (id: string) => {
    setLoadingId(id)
    await supabase
      .from('checklist_items')
      .update({ is_completed: false, completed_at: null })
      .eq('id', id)
    setAllItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_completed: false, completed_at: null } : item
      )
    )
    setCompleted((c) => c - 1)
    setLoadingId(null)
  }

  const incomplete = allItems.filter((i) => !i.is_completed)
  const completedItems = allItems.filter((i) => i.is_completed)
  const urgentItems = incomplete.filter((i) => i.deadline_days <= 7)
  const upcomingItems = incomplete.filter((i) => i.deadline_days > 7)

  const progressPct = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0

  // Group incomplete items by category for the 'all' view
  const grouped: Record<string, Item[]> = {}
  for (const item of incomplete) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const filterButtons: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: incomplete.length },
    { key: 'urgent', label: 'Urgent', count: urgentItems.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingItems.length },
    { key: 'completed', label: 'Completed', count: completedItems.length },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Overall progress</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {completed} of {totalCount} steps complete
            </p>
          </div>
          <span className="text-xl font-bold text-emerald-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterButtons.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === key ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {allItems.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700">No checklist items yet</p>
          <p className="text-sm text-gray-400 mt-1">Head to the dashboard to generate your checklist.</p>
        </div>
      )}

      {/* All view — grouped by category */}
      {filter === 'all' && (
        <>
          {Object.keys(grouped).length === 0 && completedItems.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <p className="text-emerald-700 font-semibold">Everything&apos;s done!</p>
              <p className="text-emerald-600 text-sm mt-1">You&apos;ve completed all your steps.</p>
            </div>
          )}
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
                {category}
              </h3>
              <div className="flex flex-col gap-2">
                {catItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    loading={loadingId === item.id}
                    onMarkComplete={markComplete}
                    onMarkIncomplete={markIncomplete}
                  />
                ))}
              </div>
            </div>
          ))}
          {completedItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Completed
              </h3>
              <div className="flex flex-col gap-2">
                {completedItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    loading={loadingId === item.id}
                    onMarkComplete={markComplete}
                    onMarkIncomplete={markIncomplete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Urgent filter */}
      {filter === 'urgent' && (
        <ItemList
          items={urgentItems}
          loadingId={loadingId}
          onMarkComplete={markComplete}
          onMarkIncomplete={markIncomplete}
          emptyText="No urgent items right now."
        />
      )}

      {/* Upcoming filter */}
      {filter === 'upcoming' && (
        <ItemList
          items={upcomingItems}
          loadingId={loadingId}
          onMarkComplete={markComplete}
          onMarkIncomplete={markIncomplete}
          emptyText="No upcoming items."
        />
      )}

      {/* Completed filter */}
      {filter === 'completed' && (
        <ItemList
          items={completedItems}
          loadingId={loadingId}
          onMarkComplete={markComplete}
          onMarkIncomplete={markIncomplete}
          emptyText="Nothing completed yet — you can do it!"
        />
      )}
    </div>
  )
}

function ItemList({
  items,
  loadingId,
  onMarkComplete,
  onMarkIncomplete,
  emptyText,
}: {
  items: Item[]
  loadingId: string | null
  onMarkComplete: (id: string) => void
  onMarkIncomplete: (id: string) => void
  emptyText: string
}) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">{emptyText}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          loading={loadingId === item.id}
          onMarkComplete={onMarkComplete}
          onMarkIncomplete={onMarkIncomplete}
        />
      ))}
    </div>
  )
}

function ItemRow({
  item,
  loading,
  onMarkComplete,
  onMarkIncomplete,
}: {
  item: Item
  loading: boolean
  onMarkComplete: (id: string) => void
  onMarkIncomplete: (id: string) => void
}) {
  const badge = urgencyBadge(item.deadline_days)

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border transition ${
        item.is_completed
          ? 'border-gray-100 opacity-60'
          : 'border-gray-100 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() =>
            item.is_completed ? onMarkIncomplete(item.id) : onMarkComplete(item.id)
          }
          disabled={loading}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
            item.is_completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 hover:border-emerald-400'
          } disabled:opacity-50`}
          aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {item.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {loading && (
            <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className={`text-xs font-medium ${
                item.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}
            >
              {item.title}
            </span>
            {!item.is_completed && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          <p
            className={`text-xs leading-relaxed ${
              item.is_completed ? 'text-gray-400 line-through' : 'text-gray-500'
            }`}
          >
            {item.description}
          </p>
          {item.official_link && !item.is_completed && (
            <a
              href={item.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline mt-1 inline-block"
            >
              Official link →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
