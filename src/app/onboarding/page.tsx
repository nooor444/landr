'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Answers = {
  name: string
  destination: string
  situation: string
  visa: string
  purpose: string
}

const IRELAND_VISAS = [
  { value: 'Stamp 2', label: 'Stamp 2', subtitle: 'Student permission' },
  { value: 'Stamp 1G', label: 'Stamp 1G', subtitle: 'Post-study job seeking' },
  { value: 'Critical Skills Employment Permit', label: 'Critical Skills', subtitle: 'High-demand skills worker' },
  { value: 'General Employment Permit', label: 'General Employment', subtitle: 'Standard work permit' },
  { value: 'Stamp 3', label: 'Stamp 3', subtitle: 'Dependent / non-working spouse' },
  { value: 'Stamp 4', label: 'Stamp 4', subtitle: 'Long-term residence' },
]

const UK_VISAS = [
  { value: 'Student Visa', label: 'Student Visa', subtitle: 'Studying at a UK institution' },
  { value: 'Graduate Route Visa', label: 'Graduate Route', subtitle: 'Post-study work visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker', subtitle: 'Sponsored skilled employment' },
  { value: 'Health and Care Worker Visa', label: 'Health & Care Worker', subtitle: 'NHS and care sector' },
  { value: 'Indefinite Leave to Remain', label: 'ILR', subtitle: 'Permanent residence' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    name: '',
    destination: '',
    situation: '',
    visa: '',
    purpose: '',
  })
  const [saving, setSaving] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const totalSteps = 5

  const advance = () => setStep(s => s + 1)

  const select = (field: keyof Omit<Answers, 'name'>, value: string) => {
    const updated = { ...answers, [field]: value }
    setAnswers(updated)
    if (step < totalSteps) {
      setTimeout(() => setStep(s => s + 1), 180)
    } else {
      handleComplete(updated)
    }
  }

  const submitName = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = answers.name.trim()
    if (!trimmed) return
    setAnswers(prev => ({ ...prev, name: trimmed }))
    advance()
  }

  const handleComplete = async (finalAnswers: Answers) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: finalAnswers.name.trim(),
        destination_country: finalAnswers.destination,
        situation: finalAnswers.situation,
        visa_type: finalAnswers.visa,
      })
      await fetch('/api/generate-checklist', { method: 'POST' }).catch(() => null)
    }
    router.push('/dashboard')
  }

  const visaOptions = answers.destination === 'Ireland' ? IRELAND_VISAS : UK_VISAS

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-white/60 backdrop-blur px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <span className="text-sm font-medium text-emerald-700 whitespace-nowrap">
          Step {step} of {totalSteps}
        </span>
        <div className="flex-1 bg-emerald-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="w-full animate-fadeIn">
            <p className="text-emerald-600 font-medium text-center mb-2">Welcome to Landr 🍀</p>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
              What&apos;s your name?
            </h2>
            <p className="text-gray-500 text-center mb-10">
              Just your first name is fine — I&apos;ll use it to make this feel a bit more personal.
            </p>
            <form onSubmit={submitName} className="flex flex-col gap-4">
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Your first name"
                value={answers.name}
                onChange={e => setAnswers(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
                className="w-full bg-white border-2 border-gray-200 focus:border-emerald-400 rounded-2xl px-5 py-4 text-lg text-gray-800 placeholder-gray-300 outline-none transition"
              />
              <button
                type="submit"
                disabled={!answers.name.trim()}
                className="w-full bg-emerald-600 text-white font-semibold text-lg rounded-2xl py-4 hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Destination */}
        {step === 2 && (
          <div className="w-full animate-fadeIn">
            <p className="text-emerald-600 font-medium text-center mb-2">
              Nice to meet you, {answers.name.split(' ')[0]}!
            </p>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
              Where are you moving to?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'Ireland', emoji: '🍀', color: 'from-green-400 to-emerald-500' },
                { value: 'UK', emoji: '🇬🇧', color: 'from-blue-400 to-indigo-500' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => select('destination', opt.value)}
                  className={`bg-gradient-to-br ${opt.color} text-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-lg hover:scale-105 transition-transform cursor-pointer`}
                >
                  <span className="text-5xl">{opt.emoji}</span>
                  <span className="text-xl font-bold">{opt.value}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Situation */}
        {step === 3 && (
          <div className="w-full animate-fadeIn">
            <p className="text-emerald-600 font-medium text-center mb-2">Good choice!</p>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
              What&apos;s your current situation?
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { value: 'Just Arrived', emoji: '✈️', subtitle: 'I recently landed and I\'m getting settled' },
                { value: 'Arriving in Next 3 Months', emoji: '🗓️', subtitle: 'I\'m planning my move soon' },
                { value: 'Already Settled', emoji: '🏠', subtitle: 'I\'ve been here for a while' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => select('situation', opt.value)}
                  className="bg-white border-2 border-transparent hover:border-emerald-400 rounded-2xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg group-hover:text-emerald-700">{opt.value}</p>
                    <p className="text-gray-500 text-sm">{opt.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Visa */}
        {step === 4 && (
          <div className="w-full animate-fadeIn">
            <p className="text-emerald-600 font-medium text-center mb-2">Almost there</p>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
              What visa do you have or are applying for?
            </h2>
            <div className="flex flex-col gap-3">
              {visaOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => select('visa', opt.value)}
                  className="bg-white border-2 border-transparent hover:border-emerald-400 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-emerald-700">{opt.label}</p>
                    <p className="text-gray-500 text-sm">{opt.subtitle}</p>
                  </div>
                  <span className="text-emerald-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Purpose */}
        {step === 5 && (
          <div className="w-full animate-fadeIn">
            <p className="text-emerald-600 font-medium text-center mb-2">Last one!</p>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
              What is your main purpose?
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'Work', emoji: '💼', subtitle: 'Employment & career' },
                { value: 'Study', emoji: '📚', subtitle: 'Education & research' },
                { value: 'Family', emoji: '👨‍👩‍👧', subtitle: 'Joining family' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => select('purpose', opt.value)}
                  className="bg-white border-2 border-transparent hover:border-emerald-400 rounded-2xl p-6 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all group"
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <p className="font-semibold text-gray-800 group-hover:text-emerald-700">{opt.value}</p>
                  <p className="text-gray-400 text-xs text-center">{opt.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {saving && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Setting up your profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
