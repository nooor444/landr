'use client'

import { useState } from 'react'
import Link from 'next/link'
import { timeAgo, firstName } from '@/lib/time'

export const CATEGORIES = [
  'All',
  'Ireland - Stamp 1G',
  'Ireland - Critical Skills',
  'Ireland - Student (Stamp 2)',
  'UK - Graduate Route',
  'UK - Skilled Worker',
  'General Questions',
] as const

type Post = {
  id: string
  category: string
  title: string
  content: string
  created_at: string
  profiles: { full_name: string | null }[] | null
  community_replies: { id: string }[]
}

type Props = {
  posts: Post[]
}

export default function CommunityClient({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? posts
      : posts.filter(p => p.category === activeCategory)

  return (
    <div className="flex flex-col gap-5">
      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <p className="text-3xl mb-3">💬</p>
          <p className="font-semibold text-gray-700">No posts yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to ask a question</p>
          <Link
            href="/community/new"
            className="inline-block mt-4 bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
          >
            Ask a question
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(post => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-emerald-200 transition flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </div>
                {post.community_replies.length > 0 && (
                  <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    {post.community_replies.length}{' '}
                    {post.community_replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <span className="font-medium text-gray-500">
                  {firstName(post.profiles?.[0]?.full_name)}
                </span>
                <span>·</span>
                <span>{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
