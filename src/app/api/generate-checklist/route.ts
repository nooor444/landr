import { createClient } from '@/lib/supabase/server'
import { getChecklistTemplate } from '@/lib/checklist-templates'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('destination_country, visa_type')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { destination_country, visa_type } = profile

  if (!destination_country || !visa_type) {
    return NextResponse.json(
      { error: 'Profile incomplete — destination and visa type required' },
      { status: 400 }
    )
  }

  // Check if items already exist — avoid duplicates
  const { count } = await supabase
    .from('checklist_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count > 0) {
    return NextResponse.json({ message: 'Checklist already exists', count })
  }

  const templates = getChecklistTemplate(destination_country, visa_type)

  const rows = templates.map((t) => ({
    user_id: user.id,
    title: t.title,
    description: t.description,
    category: t.category,
    priority: t.priority,
    official_link: t.official_link ?? null,
    deadline_days: t.deadline_days,
    is_completed: false,
  }))

  const { error: insertError } = await supabase
    .from('checklist_items')
    .insert(rows)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Checklist generated', count: rows.length })
}
