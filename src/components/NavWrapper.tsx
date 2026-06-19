import { createClient } from '@/lib/supabase/server'
import Nav from './Nav'

export default async function NavWrapper() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName: string | undefined
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    userName =
      profile?.full_name?.split(' ')[0] ||
      user.user_metadata?.name?.split(' ')[0] ||
      user.email?.split('@')[0]
  }

  return <Nav userName={userName} />
}
