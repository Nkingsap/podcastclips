import { redirect, notFound } from 'next/navigation'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function ClipsPage({ params }: { params: { id: string } }) {
    const user = await getOrCreateUser()
    if (!user) redirect('/sign-in')

    const podcast = await db.podcast.findFirst({
        where: { id: params.id, userId: user.id },
        include: { clips: { orderBy: { startSec: 'asc' } } },
    })

    if (!podcast) notFound()

    if (podcast.status !== 'DONE') {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">
                        {podcast.status === 'PROCESSING' ? '⏳' : '✗'}
                    </div>
                    <h1 className="text-xl font-bold mb-2">
                        {podcast.status === 'PROCESSING' ? 'Still processing...' : 'Processing failed'}
                    </h1>
                    <p className="text-gray-400 text-sm mb-6">
                        {podcast.status === 'PROCESSING'
                            ? 'Your clips will be ready in 1–3 minutes. Refresh this page.'
                            : 'Something went wrong. Please try uploading again.'}
                    </p>
                    <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                        ← Back to dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-6 inline-block transition-colors">
                    ← Back to dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-1">{podcast.title || podcast.fileName}</h1>
                <p className="text-gray-400 text-sm mb-10">
                    {podcast.clips.length} viral clips generated · {podcast.durationSecs
                        ? `${Math.floor(podcast.durationSecs / 60)}m ${podcast.durationSecs % 60}s episode`
                        : ''}
                </p>

                <div className="grid gap-6">
                    {podcast.clips.map((clip, i) => (
                        <div key={clip.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Clip {i + 1}</span>
                                    <p className="font-semibold mt-1 text-lg">{clip.hook || 'Best moment'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {Math.floor(clip.startSec / 60)}:{String(Math.round(clip.startSec % 60)).padStart(2, '0')} –{' '}
                                        {Math.floor(clip.endSec / 60)}:{String(Math.round(clip.endSec % 60)).padStart(2, '0')}
                                        {' '}· {Math.round(clip.endSec - clip.startSec)}s
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {clip.videoUrl ? (
                                        <a
                                            href={clip.videoUrl}
                                            download
                                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            ⬇️ Download MP4
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-600 border border-gray-800 px-3 py-2 rounded-lg">
                                            Video rendering...
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-4">
                                <p className="text-sm text-gray-300 leading-relaxed italic">"{clip.transcript}"</p>
                            </div>

                            {clip.reason && (
                                <p className="text-xs text-gray-500 mt-3">
                                    💡 {clip.reason}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {user.plan === 'FREE' && (
                    <div className="mt-10 bg-purple-950 border border-purple-800 rounded-2xl p-6 text-center">
                        <p className="font-semibold mb-1">🎬 Want video clips, not just transcripts?</p>
                        <p className="text-sm text-gray-400 mb-4">Upgrade to Pro to get animated caption videos ready for TikTok, Reels & Shorts.</p>
                        <Link href="/pricing" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors inline-block">
                            Upgrade to Pro — $8/month
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
