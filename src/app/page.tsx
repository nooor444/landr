import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold text-emerald-700 mb-4">Landr</h1>
        <p className="text-xl text-gray-600 mb-2">
          Your AI companion for Indians settling in Ireland or the UK.
        </p>
        <p className="text-gray-500 mb-10">
          Personalised checklists, AI chat that knows your situation, and a community of people on the same journey.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="border border-emerald-600 text-emerald-600 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
