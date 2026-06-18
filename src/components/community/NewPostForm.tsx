'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from './CommunityClient'

const POST_CATEGORIES = CATEGORIES.filter(c => c !== 'All')

type Props = {
  userId: string
}

export default function NewPostForm({ userId }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>(POST_CATEGORIES[0])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || submitting) return

    setSubmitting(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        category,
        title: title.trim(),
        content: content.trim(),
      })
      .select('id')
      .single()

    if (insertError || !data) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`/community/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        >
          {POST_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's your question or topic?"
          maxLength={120}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Details</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share the details — the more context you give, the better answers you'll get."
          rows={6}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none leading-relaxed"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
          className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-40"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
