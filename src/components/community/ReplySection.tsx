'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, firstName } from '@/lib/time'

type Reply = {
  id: string
  content: string
  created_at: string
  profiles: { full_name: string | null }[] | null
}

type Props = {
  postId: string
  initialReplies: Reply[]
  currentUserId: string
}

export default function ReplySection({ postId, initialReplies, currentUserId }: Props) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('community_replies')
      .insert({ post_id: postId, user_id: currentUserId, content: trimmed })
      .select('id, content, created_at, profiles(full_name)')
      .single()

    if (!error && data) {
      setReplies(prev => [...prev, data as Reply])
      setText('')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-gray-700 text-sm">
        {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
      </h2>

      {/* Reply list */}
      {replies.map(reply => (
        <div key={reply.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
            <span className="font-medium text-gray-500">
              {firstName(reply.profiles?.[0]?.full_name)}
            </span>
            <span>·</span>
            <span>{timeAgo(reply.created_at)}</span>
          </div>
        </div>
      ))}

      {/* Reply form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a reply…"
          rows={3}
          disabled={submitting}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="self-end bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-40"
        >
          {submitting ? 'Posting…' : 'Post reply'}
        </button>
      </form>
    </div>
  )
}
