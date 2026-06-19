import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavWrapper from '@/components/NavWrapper'
import CommunityClient from '@/components/community/CommunityClient'

export default async function CommunityPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('community_posts')
    .select(`
      id, category, title, content, created_at,
      profiles ( full_name ),
      community_replies ( id )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <NavWrapper />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Community</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Questions and stories from people on the same journey
            </p>
          </div>
          <Link
            href="/community/new"
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition flex-shrink-0"
          >
            + New Post
          </Link>
        </div>

        <CommunityClient posts={(posts ?? []) as unknown as Parameters<typeof CommunityClient>[0]['posts']} />
      </main>
    </div>
  )
}
