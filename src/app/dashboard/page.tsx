import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from '@/components/dashboard/DashboardClient'
import GenerateChecklistButton from '@/components/dashboard/GenerateChecklistButton'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, destination_country, visa_type, situation')
    .eq('id', user.id)
    .single()

  const onboardingComplete =
    profile?.destination_country && profile?.visa_type

  // Fetch all checklist items to compute progress
  const { data: allItems } = await supabase
    .from('checklist_items')
    .select('id, is_completed')
    .eq('user_id', user.id)

  const totalCount = allItems?.length ?? 0
  const completedCount = allItems?.filter(i => i.is_completed).length ?? 0

  // Top 3 urgent incomplete items (lowest deadline_days first, then priority)
  const { data: urgentItems } = await supabase
    .from('checklist_items')
    .select('id, title, description, category, deadline_days, official_link')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .order('deadline_days', { ascending: true })
    .order('priority', { ascending: true })
    .limit(3)

  const displayName =
    profile?.full_name?.split(' ')[0] ||
    user.user_metadata?.name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'there'

  const destination = profile?.destination_country ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-700">Landr</span>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/checklist" className="hover:text-emerald-600 transition">Checklist</Link>
            <Link href="/community" className="hover:text-emerald-600 transition">Community</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Onboarding banner */}
        {!onboardingComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800 text-sm">Finish your setup</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Complete the quiz so we can build your personalised checklist.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition whitespace-nowrap"
            >
              Finish quiz →
            </Link>
          </div>
        )}

        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {displayName}.
          </h1>
          {destination && (
            <p className="text-gray-500 mt-1 text-lg">
              Let&apos;s get you settled in {destination}.
            </p>
          )}
        </div>

        {/* Checklist section */}
        {onboardingComplete && totalCount === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">📋</div>
            <div>
              <p className="font-semibold text-gray-800">Your checklist isn&apos;t generated yet</p>
              <p className="text-sm text-gray-500 mt-1">
                We&apos;ll build a step-by-step plan tailored to your visa and destination.
              </p>
            </div>
            <GenerateChecklistButton />
          </div>
        ) : (
          <DashboardClient
            initialItems={urgentItems ?? []}
            totalCount={totalCount}
            completedCount={completedCount}
          />
        )}

        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/checklist"
            className="bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition group shadow-sm"
          >
            <span className="text-3xl">✅</span>
            <span className="font-semibold text-gray-800 group-hover:text-emerald-700 transition">
              View Full Checklist
            </span>
            <span className="text-xs text-gray-400">All your steps in one place</span>
          </Link>
          <Link
            href="/chat"
            className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition group shadow-sm"
          >
            <span className="text-3xl">💬</span>
            <span className="font-semibold text-white">Ask a Question</span>
            <span className="text-xs text-emerald-200">AI that knows your situation</span>
          </Link>
        </div>

        {/* Community teaser */}
        <Link
          href="/community"
          className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-emerald-200 transition"
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
      </main>
    </div>
  )
}
