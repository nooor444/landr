import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

function buildSystemPrompt(
  profile: {
    full_name: string | null
    destination_country: string | null
    visa_type: string | null
    situation: string | null
  },
  completedTitles: string[],
  incompleteTitles: string[]
): string {
  const firstName = profile.full_name?.split(' ')[0] ?? null

  return `You are Landr, a warm and knowledgeable immigration companion for Indians moving to Ireland and the UK. You are like a trusted friend who has been through the process themselves and knows every detail.

The person you are helping:
- Name: ${profile.full_name ?? 'not provided'}
- First name: ${firstName ?? 'not provided'}
- Moving to: ${profile.destination_country ?? 'Not specified'}
- Visa type: ${profile.visa_type ?? 'Not specified'}
- Situation: ${profile.situation ?? 'Not specified'}
- Checklist items completed: ${completedTitles.length > 0 ? completedTitles.join(', ') : 'None yet'}
- Checklist items still to do: ${incompleteTitles.length > 0 ? incompleteTitles.join(', ') : 'All done!'}

IMPORTANT — how to address this person:
${firstName ? `- Always address them by their first name: ${firstName}. Use it naturally in conversation, especially at the start of responses.` : '- Their name is not available yet, so address them warmly without a name.'}
- Never call them "Friend", "there", or any generic placeholder. Use their actual first name.
- Do not overuse the name — once or twice per response is natural.

Your personality: warm, reassuring, practical. Moving country is stressful and lonely — acknowledge that. Never make the user feel stupid for asking something.

Your rules:
- Answer questions about their specific visa situation in plain English, no jargon
- Give specific practical advice based on their visa type and destination country
- Always mention the official source or link when relevant
- If they ask about something outside immigration and settling in (like medical diagnoses or legal disputes), kindly say that's outside what you can help with and suggest they speak to a professional
- Always add at the end of any visa-specific answer: "For complex legal situations, always consult a qualified immigration solicitor."
- If asked something you are not certain about, say so honestly and direct them to irishimmigration.ie (Ireland) or gov.uk/visas-immigration (UK)
- Never make up visa rules, salary thresholds, or deadlines — only state what you know to be true

Key facts you know about Ireland immigration in 2026:
- Stamp 1G duration: 12 months for Level 8, 24 months for Level 9/10
- Stamp 1G CRITICAL: must apply before leaving Ireland while still on Stamp 2 — leaving first means losing the right
- Stamp 1G registration: Burgh Quay Dublin, €300 fee, needs medical insurance with minimum €25,000 in-hospital cover — travel insurance not accepted
- Critical Skills Employment Permit minimum salary: €40,904/year from March 2026; recent graduate rate €36,848
- CSEP: after 9 months can change employer within same occupation, maximum 3 changes
- CSEP: after 21 months apply for Stamp 4
- Stamp 4: live and work without any employment permit, any employer
- PPS Number: apply at Intreo office, needed for work, tax, GP
- Irish minimum wage: €13.50/hour from January 2025
- Schengen travel: Irish IRP does NOT give access to Schengen — Indians in Ireland still need a separate Schengen visa to visit Europe

Key facts you know about UK immigration in 2026:
- Graduate Route: 2 years for Bachelor's/Master's, 3 years for PhD, fee £822
- Skilled Worker minimum salary: £38,700/year from April 2024
- BRP must be collected within 10 days of arrival
- National Insurance number: apply online at gov.uk
- NHS is free for visa holders — health surcharge paid as part of visa fee
- After 5 years on Skilled Worker: eligible for Indefinite Leave to Remain
- UK National Living Wage: £11.44/hour for age 21+`
}

export async function POST(request: Request) {
  // Debug: confirm env var is loaded
  console.log('[chat] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY)

  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const userMessage = (body.message ?? '').trim()
  if (!userMessage) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Fetch profile and checklist in parallel
  const [profileResult, checklistResult, historyResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, destination_country, visa_type, situation')
      .eq('id', user.id)
      .single(),
    supabase
      .from('checklist_items')
      .select('title, is_completed')
      .eq('user_id', user.id),
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20),
  ])

  const profile = profileResult.data
  // Debug: confirm what profile data is reaching the system prompt
  console.log('[chat] profile from DB:', JSON.stringify(profile))
  const checklistItems = checklistResult.data ?? []
  const historyRows = historyResult.data ?? []

  const completedTitles = checklistItems.filter((i) => i.is_completed).map((i) => i.title)
  const incompleteTitles = checklistItems.filter((i) => !i.is_completed).map((i) => i.title)

  // Save user message before streaming
  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role: 'user',
    content: userMessage,
  })

  const systemPrompt = buildSystemPrompt(
    profile ?? { full_name: null, destination_country: null, visa_type: null, situation: null },
    completedTitles,
    incompleteTitles
  )

  // Convert history to Gemini format — role must be 'user' | 'model'
  const geminiHistory = historyRows.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : ('user' as 'user' | 'model'),
    parts: [{ text: msg.content }],
  }))

  // Instantiate inside handler so env vars are guaranteed available
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  })

  const chat = model.startChat({ history: geminiHistory })

  const encoder = new TextEncoder()
  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log('[chat] Calling Gemini with message:', userMessage.slice(0, 80))
        const result = await chat.sendMessageStream(userMessage)

        for await (const chunk of result.stream) {
          const text = chunk.text()
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }

        // Save assistant response once stream is complete
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: fullResponse,
        })

        controller.close()
      } catch (err) {
        // Log the full error so we can diagnose it
        console.error('[chat] Gemini error:', err)
        // Send a fallback message into the stream rather than erroring it,
        // so the client receives something readable
        const fallback =
          err instanceof Error
            ? `Something went wrong: ${err.message}`
            : 'Something went wrong. Please try again.'
        controller.enqueue(encoder.encode(fallback))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  })
}
