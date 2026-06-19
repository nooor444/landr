import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import NavWrapper from '@/components/NavWrapper'
import ReplySection from '@/components/community/ReplySection'
import { timeAgo, firstName } from '@/lib/time'

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [postResult, repliesResult] = await Promise.all([
    supabase
      .from('community_posts')
      .select('id, category, title, content, created_at, profiles ( full_name )')
      .eq('id', params.id)
      .single(),
    supabase
      .from('community_replies')
      .select('id, content, created_at, profiles ( full_name )')
      .eq('post_id', params.id)
      .order('created_at', { ascending: true }),
  ])

  if (!postResult.data) notFound()

  const post = postResult.data
  const replies = repliesResult.data ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <NavWrapper />
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Back */}
        <Link
          href="/community"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        {/* Original post */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              {post.category}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            <span className="font-medium text-gray-500">
              {firstName(
                Array.isArray(post.profiles)
                  ? (post.profiles as { full_name: string | null }[])[0]?.full_name
                  : null
              )}
            </span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>

        {/* Replies */}
        <ReplySection
          postId={post.id}
          initialReplies={replies as unknown as Parameters<typeof ReplySection>[0]['initialReplies']}
          currentUserId={user.id}
        />
      </main>
    </div>
  )
}
