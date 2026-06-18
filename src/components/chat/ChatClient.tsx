'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

type DbMessage = {
  id: string
  role: string
  content: string
  created_at: string
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

type Profile = {
  full_name: string | null
  destination_country: string | null
  visa_type: string | null
  situation: string | null
}

type Props = {
  profile: Profile
  previousMessages: DbMessage[]
  welcomeMessage: string
  displayName: string
}

const SUGGESTED_CHIPS = [
  'What should I do first?',
  'What are my work rights?',
  'Can I travel home and come back?',
]

function dbToMessage(m: DbMessage): Message {
  return {
    id: m.id,
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }
}

export default function ChatClient({
  profile,
  previousMessages,
  welcomeMessage,
  displayName,
}: Props) {
  const isFirstSession = previousMessages.length === 0

  const [messages, setMessages] = useState<Message[]>(
    previousMessages.map(dbToMessage)
  )
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    setInput('')
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)

    const streamingId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: streamingId, role: 'assistant', content: '', streaming: true },
    ])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed to get response')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId ? { ...m, content: m.content + chunk } : m
          )
        )
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId ? { ...m, streaming: false } : m
        )
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again.",
                streaming: false,
              }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const contextLabel = [profile.destination_country, profile.visa_type]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-semibold text-gray-800 text-sm leading-tight">Landr AI</h1>
            {contextLabel && (
              <p className="text-xs text-emerald-600 font-medium">
                Helping you settle in {contextLabel}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/community" className="text-xs text-gray-500 hover:text-emerald-600 transition font-medium">
            Community
          </Link>
          <Link href="/checklist" className="text-xs text-gray-500 hover:text-emerald-600 transition font-medium">
            Checklist
          </Link>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-4">

          {/* Welcome message — always shown */}
          <div className="flex gap-3 items-end">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mb-1">
              <span className="text-xs">🍀</span>
            </div>
            <div className="flex flex-col gap-2 max-w-[80%]">
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-700 leading-relaxed">
                {welcomeMessage}
              </div>
              {/* Chips only on first session or when no messages yet */}
              {(isFirstSession || messages.length === 0) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {SUGGESTED_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      disabled={isStreaming}
                      className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversation messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mb-1">
                  <span className="text-xs">🍀</span>
                </div>
              )}

              {msg.role === 'user' ? (
                <div className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-emerald-600 text-white">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-xl rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-white text-gray-700 shadow-sm border border-gray-100">
                  {!msg.content && msg.streaming ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : (
                    <>
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-0.5 first:mt-0">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-outside pl-4 mb-2 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-outside pl-4 mb-2 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-700">
                              {children}
                            </a>
                          ),
                          code: ({ children }) => <code className="bg-gray-100 text-gray-800 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg.streaming && (
                        <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
                      )}
                    </>
                  )}
                </div>
              )}

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mb-1 text-white text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-end gap-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your visa, checklist, or settling in…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 leading-relaxed max-h-32 overflow-y-auto dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-40 flex-shrink-0"
            aria-label="Send message"
          >
            {isStreaming ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-300 mt-2 max-w-2xl mx-auto">
          For complex legal situations, always consult a qualified immigration solicitor.
        </p>
      </div>
    </div>
  )
}
