import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavWrapper from '@/components/NavWrapper'
import NewPostForm from '@/components/community/NewPostForm'

export default async function NewPostPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <NavWrapper />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/community"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition w-fit mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 mb-1">New post</h1>
          <p className="text-sm text-gray-500 mb-6">
            Ask a question or share something useful with the community.
          </p>
          <NewPostForm userId={user.id} />
        </div>
      </main>
    </div>
  )
}
