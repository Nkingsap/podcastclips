import Link from 'next/link'

const features = {
    free: ['2 podcasts/month', 'AI clip detection', 'Static image cards', 'Transcript download', 'Watermark on exports'],
    pro: ['Unlimited podcasts', 'AI clip detection', 'Animated caption videos', 'MP4 + SRT download', 'No watermark', '3 video formats (9:16, 1:1, 16:9)', 'Custom branding', 'Priority processing'],
}

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl">🎙️</span>
                    <span className="font-bold">PodcastClips</span>
                </Link>
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Dashboard →
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-black mb-4">Simple, transparent pricing</h1>
                <p className="text-gray-400 mb-16">Start free. Upgrade when you're ready to go viral.</p>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                    {/* Free */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-1">Free</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black">$0</span>
                                <span className="text-gray-400">/month</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Perfect for trying things out</p>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {features.free.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                                    <span className="text-gray-600">✓</span> {f}
                                </li>
                            ))}
                        </ul>
                        <Link href="/sign-up" className="block text-center border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white py-3 rounded-xl text-sm font-medium transition-colors">
                            Get started free
                        </Link>
                    </div>

                    {/* Pro */}
                    <div className="bg-purple-950 border border-purple-700 rounded-2xl p-8 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                            MOST POPULAR
                        </div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-1">Pro</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black">$8</span>
                                <span className="text-purple-300">/month</span>
                            </div>
                            <p className="text-sm text-purple-300 mt-2">For serious creators</p>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {features.pro.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-purple-100">
                                    <span className="text-purple-400">✓</span> {f}
                                </li>
                            ))}
                        </ul>
                        <form action="/api/checkout" method="POST">
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
                                Upgrade to Pro →
                            </button>
                        </form>
                        <p className="text-center text-xs text-purple-400 mt-3">Cancel anytime · 30-day money-back guarantee</p>
                    </div>
                </div>

                <div className="mt-16 text-gray-500 text-sm">
                    <p>Questions? Email us at <a href="mailto:support@podcastclips.ai" className="text-purple-400 hover:underline">support@podcastclips.ai</a></p>
                </div>
            </main>
        </div>
    )
}
