import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/auth'
import { createCustomerPortalSession } from '@/lib/stripe'
import Link from 'next/link'

export default async function BillingPage() {
    const user = await getOrCreateUser()
    if (!user) redirect('/sign-in')

    const isPro = user.plan === 'PRO'

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-6 py-16">
                <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors">
                    ← Back to dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-8">Billing & Plan</h1>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Current plan</p>
                            <p className="text-xl font-bold">{isPro ? 'Pro' : 'Free'}</p>
                            {!isPro && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {Math.max(0, 2 - user.podcastsUsed)} of 2 podcasts remaining this month
                                </p>
                            )}
                            {isPro && user.subscription && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Renews {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${isPro ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
                            {isPro ? 'PRO' : 'FREE'}
                        </span>
                    </div>
                </div>

                {isPro ? (
                    <form action="/api/portal" method="POST">
                        <button type="submit" className="w-full border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white py-3 rounded-xl text-sm font-medium transition-colors">
                            Manage subscription (cancel, update card)
                        </button>
                    </form>
                ) : (
                    <div className="text-center bg-purple-950 border border-purple-800 rounded-2xl p-8">
                        <p className="text-4xl mb-4">🚀</p>
                        <h2 className="text-xl font-bold mb-2">Upgrade to Pro</h2>
                        <p className="text-gray-400 text-sm mb-6">Unlimited podcasts · Animated caption videos · No watermark</p>
                        <form action="/api/checkout" method="POST">
                            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                                Upgrade — $8/month
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
