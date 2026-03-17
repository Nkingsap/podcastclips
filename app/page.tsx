import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function HomePage() {
  const { userId } = await auth()
  const isSignedIn = !!userId

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <span className="font-bold text-xl tracking-tight">PodcastClips</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
            Pricing
          </Link>
          {!isSignedIn ? (
            <>
              <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Get started free
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-950 border border-purple-800 text-purple-300 text-sm px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          AI-powered · Works with any podcast
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
          Turn your podcast into{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            5 viral clips
          </span>{' '}
          in minutes
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Upload any podcast. Our AI finds the best moments, generates captions, and
          exports ready-to-post short videos for TikTok, Reels, and Shorts.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-900">
            Start free — 2 podcasts/month
          </Link>
          <Link href="/pricing" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg transition-colors">
            See pricing →
          </Link>
        </div>

        <p className="text-sm text-gray-600 mt-4">No credit card required · Free forever plan</p>

        <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            { icon: '🤖', title: 'AI finds the best moments', desc: "Upload your audio. GPT-4 analyzes your transcript and picks the 5 moments most likely to go viral." },
            { icon: '🎬', title: 'Auto-generated caption videos', desc: 'Get animated caption videos (9:16, 1:1, or 16:9) with synced subtitles ready for every platform.' },
            { icon: '🌍', title: 'Works in any language', desc: 'Powered by OpenAI Whisper — supports 90+ languages. Your audience is global, your clips should be too.' },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        <p>© 2026 PodcastClips · Built with ❤️ for creators worldwide</p>
      </footer>
    </div>
  )
}
