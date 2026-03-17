import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PodcastClips — Turn Podcasts Into Viral Short Videos',
  description:
    'AI-powered podcast clip generator. Upload any podcast and get 5 viral-ready short video clips for TikTok, Reels, and Shorts in minutes.',
  openGraph: {
    title: 'PodcastClips — Turn Podcasts Into Viral Short Videos',
    description: 'AI-powered podcast clip generator. Upload any podcast and get 5 viral-ready short video clips in minutes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PodcastClips',
    description: 'Turn any podcast into 5 viral short video clips with AI.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
