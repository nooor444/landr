import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from '@/components/chat/ChatClient'

export default async function ChatPage() {
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

  const { data: previousMessages } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(50)

  const displayName =
    profile?.full_name?.split(' ')[0] ||
    user.user_metadata?.name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'there'

  const welcomeMessage = profile?.destination_country && profile?.visa_type && profile?.situation
    ? `Hi ${displayName}! I'm Landr, your settlement companion. I know you're ${profile.situation.toLowerCase()} in ${profile.destination_country} on a ${profile.visa_type}. What would you like help with today? You can ask me anything — visa questions, what to do next, your rights at work, or just what to expect.`
    : `Hi ${displayName}! I'm Landr, your settlement companion. I'm here to help you navigate moving to Ireland or the UK. What would you like help with today?`

  return (
    <ChatClient
      profile={{
        full_name: profile?.full_name ?? null,
        destination_country: profile?.destination_country ?? null,
        visa_type: profile?.visa_type ?? null,
        situation: profile?.situation ?? null,
      }}
      previousMessages={previousMessages ?? []}
      welcomeMessage={welcomeMessage}
      displayName={displayName}
    />
  )
}
