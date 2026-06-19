'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

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

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  Immigration: { emoji: '🏛️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  Banking: { emoji: '💰', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  Finance: { emoji: '💰', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  Health: { emoji: '🏥', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  'Work Rights': { emoji: '💼', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  Tax: { emoji: '📋', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  Housing: { emoji: '🏠', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  Transport: { emoji: '🚌', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  Education: { emoji: '🎓', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  Admin: { emoji: '📋', color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? { emoji: '📌', color: 'bg-gray-50 text-gray-700 border-gray-200' }
}

function urgencyBadge(deadline_days: number) {
  if (deadline_days === 0) return { text: 'Do immediately', color: 'bg-red-100 text-red-700' }
  if (deadline_days <= 7) return { text: `Within ${deadline_days}d`, color: 'bg-amber-100 text-amber-700' }
  return { text: `Within ${deadline_days}d`, color: 'bg-emerald-100 text-emerald-700' }
}

function leftBorderColor(deadline_days: number, is_completed: boolean) {
  if (is_completed) return 'border-l-emerald-400'
  if (deadline_days === 0) return 'border-l-red-500'
  if (deadline_days <= 7) return 'border-l-amber-400'
  return 'border-l-emerald-300'
}

// CSS-only donut chart
function DonutChart({ pct }: { pct: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{pct}%</span>
        <span className="text-xs text-gray-400">done</span>
      </div>
    </div>
  )
}

function AccordionItem({
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
  const [expanded, setExpanded] = useState(false)
  const badge = urgencyBadge(item.deadline_days)
  const borderColor = leftBorderColor(item.deadline_days, item.is_completed)

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColor} shadow-sm overflow-hidden transition-all duration-200 ${
        item.is_completed ? 'opacity-60' : 'hover:border-r-emerald-100 hover:shadow-md'
      }`}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Checkbox */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            if (item.is_completed) { onMarkIncomplete(item.id) } else { onMarkComplete(item.id) }
          }}
          disabled={loading}
          aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
            item.is_completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 hover:border-emerald-400 hover:scale-110'
          } disabled:opacity-50`}
        >
          {item.is_completed && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {loading && (
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <span
            className={`text-sm font-semibold leading-snug ${
              item.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}
          >
            {item.title}
          </span>
          {!item.is_completed && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>

        <span className={`text-gray-400 text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-50 pt-3">
          <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          <div className="flex items-center justify-between">
            {item.official_link && !item.is_completed ? (
              <a
                href={item.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline"
              >
                Official link →
              </a>
            ) : (
              <span />
            )}
            {!item.is_completed && (
              <button
                onClick={() => onMarkComplete(item.id)}
                disabled={loading}
                className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChecklistClient({ items, totalCount, completedCount }: Props) {
  const [allItems, setAllItems] = useState<Item[]>(items)
  const [completed, setCompleted] = useState(completedCount)
  const [filter, setFilter] = useState<Filter>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)
  const supabase = createClient()

  const markComplete = async (id: string) => {
    setLoadingId(id)
    await supabase
      .from('checklist_items')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
    const updated = allItems.map(item =>
      item.id === id ? { ...item, is_completed: true, completed_at: new Date().toISOString() } : item
    )
    setAllItems(updated)
    const newCompleted = completed + 1
    setCompleted(newCompleted)
    setLoadingId(null)

    // Confetti on last item
    if (newCompleted === totalCount) {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } })
    }
  }

  const markIncomplete = async (id: string) => {
    setLoadingId(id)
    await supabase
      .from('checklist_items')
      .update({ is_completed: false, completed_at: null })
      .eq('id', id)
    setAllItems(prev =>
      prev.map(item => (item.id === id ? { ...item, is_completed: false, completed_at: null } : item))
    )
    setCompleted(c => c - 1)
    setLoadingId(null)
  }

  const incomplete = allItems.filter(i => !i.is_completed)
  const completedItems = allItems.filter(i => i.is_completed)
  const urgentItems = incomplete.filter(i => i.deadline_days <= 7)
  const upcomingItems = incomplete.filter(i => i.deadline_days > 7)
  const progressPct = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0

  // Group incomplete items by category
  const grouped: Record<string, Item[]> = {}
  for (const item of incomplete) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const filterButtons: { key: Filter; label: string; count: number; activeClass: string }[] = [
    { key: 'all', label: 'All', count: incomplete.length, activeClass: 'bg-emerald-600 text-white' },
    { key: 'urgent', label: '🔴 Urgent', count: urgentItems.length, activeClass: 'bg-red-500 text-white' },
    { key: 'upcoming', label: '🟡 Upcoming', count: upcomingItems.length, activeClass: 'bg-amber-500 text-white' },
    { key: 'completed', label: '✅ Done', count: completedItems.length, activeClass: 'bg-gray-700 text-white' },
  ]

  const activeFilterItems =
    filter === 'urgent' ? urgentItems
    : filter === 'upcoming' ? upcomingItems
    : filter === 'completed' ? completedItems
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Donut hero */}
      <div className="animate-slideUp bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
        <DonutChart pct={progressPct} />
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {completed} <span className="text-gray-400 font-normal text-lg">of {totalCount}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">tasks complete</p>
          {progressPct === 100 && (
            <p className="text-emerald-600 font-semibold text-sm mt-2">You&apos;re fully settled in! ⭐</p>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {filterButtons.map(({ key, label, count, activeClass }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all hover:scale-[1.03] ${
              filter === key
                ? `${activeClass} shadow-sm`
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === key ? 'bg-white/25 text-inherit' : 'bg-gray-100 text-gray-500'
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

      {/* Filtered view for urgent / upcoming / completed */}
      {activeFilterItems !== null && (
        <>
          {activeFilterItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">
                {filter === 'urgent' ? 'No urgent items right now.' :
                 filter === 'upcoming' ? 'No upcoming items.' :
                 'Nothing completed yet — you can do it!'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeFilterItems.map(item => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  loading={loadingId === item.id}
                  onMarkComplete={markComplete}
                  onMarkIncomplete={markIncomplete}
                />
              ))}
            </div>
          )}
        </>
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

          {Object.entries(grouped).map(([category, catItems]) => {
            const meta = getCategoryMeta(category)
            return (
              <div key={category} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
                    {meta.emoji} {category}
                  </span>
                  <span className="text-xs text-gray-400">{catItems.length} items</span>
                </div>
                <div className="flex flex-col gap-2">
                  {catItems.map(item => (
                    <AccordionItem
                      key={item.id}
                      item={item}
                      loading={loadingId === item.id}
                      onMarkComplete={markComplete}
                      onMarkIncomplete={markIncomplete}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Collapsible completed section */}
          {completedItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCompletedOpen(o => !o)}
                className="flex items-center gap-2 px-1 text-left group"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ✅ Completed ({completedItems.length})
                </span>
                <span className={`text-gray-400 text-xs transition-transform duration-200 ${completedOpen ? 'rotate-180' : ''}`}>↓</span>
              </button>
              {completedOpen && (
                <div className="flex flex-col gap-2">
                  {completedItems.map(item => (
                    <AccordionItem
                      key={item.id}
                      item={item}
                      loading={loadingId === item.id}
                      onMarkComplete={markComplete}
                      onMarkIncomplete={markIncomplete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
