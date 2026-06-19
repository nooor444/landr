import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavWrapper from '@/components/NavWrapper'
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

  const { data: allItems } = await supabase
    .from('checklist_items')
    .select('id, is_completed')
    .eq('user_id', user.id)

  const totalCount = allItems?.length ?? 0
  const completedCount = allItems?.filter(i => i.is_completed).length ?? 0

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <NavWrapper />

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
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
              className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 hover:scale-[1.02] transition-all whitespace-nowrap"
            >
              Finish quiz →
            </Link>
          </div>
        )}

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
            displayName={displayName}
            destination={destination}
          />
        )}
      </main>
    </div>
  )
}
