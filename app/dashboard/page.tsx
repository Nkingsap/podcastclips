import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardPage() {
    const user = await getOrCreateUser()
    if (!user) redirect('/sign-in')

    const podcasts = await db.podcast.findMany({
        where: { userId: user.id },
        include: { clips: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })

    const isPro = user.plan === 'PRO'
    const usageLeft = Math.max(0, 2 - user.podcastsUsed)

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Sidebar */}
            <div className="flex">
                <aside className="w-60 min-h-screen border-r border-gray-800 p-6 flex flex-col gap-6 fixed">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🎙️</span>
                        <span className="font-bold tracking-tight">PodcastClips</span>
                    </div>
                    <nav className="flex flex-col gap-1 flex-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
                            📋 My Podcasts
                        </Link>
                        <Link href="/dashboard/upload" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm transition-colors">
                            ⬆️ Upload New
                        </Link>
                        <Link href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm transition-colors">
                            💳 Billing
                        </Link>
                    </nav>

                    {/* Plan badge */}
                    <div className="border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Current plan</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
                                {isPro ? 'PRO' : 'FREE'}
                            </span>
                        </div>
                        {!isPro && (
                            <p className="text-xs text-gray-500 mb-3">{usageLeft} podcast{usageLeft !== 1 ? 's' : ''} remaining this month</p>
                        )}
                        {!isPro && (
                            <Link href="/pricing" className="block text-center bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                                Upgrade to Pro
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <UserButton />
                        <span className="text-sm text-gray-400 truncate">{user.email}</span>
                    </div>
                </aside>

                {/* Main content */}
                <main className="ml-60 flex-1 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold">My Podcasts</h1>
                        <Link href="/dashboard/upload" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            + Upload podcast
                        </Link>
                    </div>

                    {podcasts.length === 0 ? (
                        <div className="text-center py-24 text-gray-500">
                            <div className="text-5xl mb-4">🎙️</div>
                            <p className="text-lg font-medium mb-2">No podcasts yet</p>
                            <p className="text-sm mb-6">Upload your first podcast to generate viral clips</p>
                            <Link href="/dashboard/upload" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
                                Upload your first podcast
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {podcasts.map((podcast: any) => (
                                <div key={podcast.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                      ${podcast.status === 'DONE' ? 'bg-green-900 text-green-400' :
                                                podcast.status === 'PROCESSING' ? 'bg-yellow-900 text-yellow-400' :
                                                    podcast.status === 'FAILED' ? 'bg-red-900 text-red-400' :
                                                        'bg-gray-800 text-gray-400'}`}>
                                            {podcast.status === 'DONE' ? '✓' :
                                                podcast.status === 'PROCESSING' ? '⏳' :
                                                    podcast.status === 'FAILED' ? '✗' : '○'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{podcast.title || podcast.fileName}</p>
                                            <p className="text-sm text-gray-500">
                                                {podcast.clips.length} clips · {new Date(podcast.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {podcast.status === 'DONE' && (
                                        <Link href={`/dashboard/clips/${podcast.id}`} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                            View clips →
                                        </Link>
                                    )}
                                    {podcast.status === 'PENDING' && (
                                        <span className="text-xs text-gray-500 border border-gray-700 px-3 py-1.5 rounded-lg">Ready to process</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
