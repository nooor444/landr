'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TIPS = [
  "Register with a local GP within your first week — it's free and sets you up for the healthcare system.",
  "Open a bank account early — some landlords and employers require an IBAN before anything else.",
  "Keep digital copies of every document you submit to immigration authorities.",
  "Join local Facebook groups and WhatsApp communities — they're often faster than official advice lines.",
  "The Citizens Information Centre (Ireland) and Gov.uk (UK) are your most reliable official sources.",
  "Apply for your PPS number (Ireland) or National Insurance number (UK) as soon as you arrive.",
  "Save every letter from government agencies — even utility bills help you prove your address.",
]

const MOTIVATIONAL: Record<string, string> = {
  start: 'Just getting started 🌱',
  good: 'Making great progress 💪',
  almost: 'Almost there! 🎉',
  done: "You're all settled in! ⭐",
}

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
  displayName: string
  destination: string
}

function urgencyStyle(deadline_days: number) {
  if (deadline_days === 0) return { border: 'border-l-red-500', badge: 'bg-red-50 text-red-700' }
  if (deadline_days <= 10) return { border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700' }
  return { border: 'border-l-emerald-400', badge: 'bg-emerald-50 text-emerald-700' }
}

function urgencyText(deadline_days: number) {
  if (deadline_days === 0) return 'Do immediately'
  if (deadline_days <= 10) return `Within ${deadline_days} days`
  return `Within ${deadline_days} days`
}

function UrgentItemCard({
  item,
  index,
  onComplete,
}: {
  item: ChecklistItem
  index: number
  onComplete: (id: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const style = urgencyStyle(item.deadline_days)

  const handleComplete = async () => {
    setLoading(true)
    setDone(true)
    await supabase
      .from('checklist_items')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', item.id)
    setTimeout(() => onComplete(item.id), 400)
    setLoading(false)
  }

  return (
    <div
      className={`animate-slideUp bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${style.border} overflow-hidden transition-all duration-300 ${done ? 'opacity-0 scale-95' : 'opacity-100'}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {/* Animated checkbox */}
          <button
            onClick={handleComplete}
            disabled={loading || done}
            aria-label="Mark complete"
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
              done
                ? 'bg-emerald-500 border-emerald-500 scale-110'
                : 'border-gray-300 hover:border-emerald-400 hover:scale-110'
            } disabled:opacity-50`}
          >
            {done && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                {urgencyText(item.deadline_days)}
              </span>
              <span className="text-xs text-gray-400">{item.category}</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm leading-snug">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {item.official_link ? (
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
          <button
            onClick={handleComplete}
            disabled={loading || done}
            className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
          >
            {done ? 'Done ✓' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardClient({
  initialItems,
  totalCount,
  completedCount,
  displayName,
  destination,
}: Props) {
  const [items, setItems] = useState(initialItems)
  const [completed, setCompleted] = useState(completedCount)

  const handleComplete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    setCompleted(prev => prev + 1)
  }

  const remaining = totalCount - completed
  const progressPct = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0

  const motivational =
    progressPct === 100
      ? MOTIVATIONAL.done
      : progressPct >= 61
      ? MOTIVATIONAL.almost
      : progressPct >= 26
      ? MOTIVATIONAL.good
      : MOTIVATIONAL.start

  const flag = destination === 'Ireland' ? '🇮🇪' : destination === 'UK' ? '🇬🇧' : '🌍'

  const dayIndex = new Date().getDay()
  const tip = TIPS[dayIndex]

  return (
    <>
      {/* Greeting card */}
      <div className="animate-slideUp rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-3xl font-bold tracking-tight">{displayName} {flag}</h1>
            <p className="text-emerald-100 text-sm mt-2">Here&apos;s your settlement journey so far 🌍</p>
          </div>
          <span className="text-5xl opacity-80">{flag}</span>
        </div>
      </div>

      {/* Progress card */}
      <div className="animate-slideUp bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={{ animationDelay: '60ms' }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Settlement progress</h2>
            <p className="text-sm text-gray-500 mt-0.5">{completed} of {totalCount} steps complete</p>
          </div>
          <span className="text-3xl font-bold text-emerald-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="animate-fillBar bg-gradient-to-r from-emerald-400 to-teal-500 h-4 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-3 font-medium">{motivational}</p>
        {remaining > 0 && (
          <p className="text-xs text-gray-400 mt-1">{remaining} step{remaining !== 1 ? 's' : ''} remaining</p>
        )}
      </div>

      {/* Urgent items */}
      {items.length > 0 && (
        <div className="animate-slideUp" style={{ animationDelay: '120ms' }}>
          <h2 className="font-semibold text-gray-700 mb-3 px-1 text-sm uppercase tracking-wide">Most urgent right now</h2>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <UrgentItemCard key={item.id} item={item} index={i} onComplete={handleComplete} />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && totalCount > 0 && (
        <div className="animate-slideUp bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center" style={{ animationDelay: '120ms' }}>
          <p className="text-emerald-700 font-semibold">No urgent items right now.</p>
          <p className="text-emerald-600 text-sm mt-1">Check your full checklist to see what&apos;s next.</p>
        </div>
      )}

      {/* CTA buttons */}
      <div className="animate-slideUp grid grid-cols-2 gap-4" style={{ animationDelay: '180ms' }}>
        <Link
          href="/checklist"
          className="bg-white border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:scale-[1.02] shadow-sm group"
        >
          <span className="text-3xl">✅</span>
          <span className="font-semibold text-gray-800 text-sm group-hover:text-emerald-700 transition">
            View Full Checklist
          </span>
          <span className="text-xs text-gray-400">All your steps in one place</span>
        </Link>
        <Link
          href="/chat"
          className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:scale-[1.02] shadow-sm group"
        >
          <span className="text-3xl">💬</span>
          <span className="font-semibold text-white text-sm">Ask a Question</span>
          <span className="text-xs text-emerald-100">AI that knows your situation</span>
        </Link>
      </div>

      {/* Community teaser */}
      <Link
        href="/community"
        className="animate-slideUp bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-emerald-200 hover:scale-[1.01] transition-all"
        style={{ animationDelay: '240ms' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Community Forum</p>
            <p className="text-xs text-gray-500">Questions, tips, and stories from people on the same journey</p>
          </div>
        </div>
        <span className="text-gray-300 text-lg">→</span>
      </Link>

      {/* Tip of the day */}
      <div className="animate-slideUp bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3" style={{ animationDelay: '300ms' }}>
        <span className="text-2xl flex-shrink-0">💡</span>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Tip of the day</p>
          <p className="text-sm text-amber-900 leading-relaxed">{tip}</p>
        </div>
      </div>
    </>
  )
}
