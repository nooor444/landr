import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChecklistClient from '@/components/checklist/ChecklistClient'

export default async function ChecklistPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, destination_country, visa_type')
    .eq('id', user.id)
    .single()

  const { data: items } = await supabase
    .from('checklist_items')
    .select(
      'id, title, description, category, priority, is_completed, completed_at, official_link, deadline_days'
    )
    .eq('user_id', user.id)
    .order('priority', { ascending: true })

  const all = items ?? []
  const totalCount = all.length
  const completedCount = all.filter((i) => i.is_completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-emerald-700">
            Landr
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-emerald-600 transition">
              Dashboard
            </Link>
            <Link href="/chat" className="hover:text-emerald-600 transition">
              Ask AI
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Checklist</h1>
          {profile?.destination_country && profile?.visa_type && (
            <p className="text-gray-500 text-sm mt-1">
              {profile.destination_country} · {profile.visa_type}
            </p>
          )}
        </div>

        <ChecklistClient
          items={all}
          totalCount={totalCount}
          completedCount={completedCount}
        />
      </main>
    </div>
  )
}
