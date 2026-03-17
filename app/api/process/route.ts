import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, canProcessPodcast } from '@/lib/auth'
import { db } from '@/lib/db'
import { transcribeAudio, detectBestClips } from '@/lib/ai'
import { createClient } from '@supabase/supabase-js'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { z } from 'zod'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({
    podcastId: z.string().min(1),
})

// POST /api/process — trigger the AI pipeline for a podcast
export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        if (!canProcessPodcast(user)) {
            return NextResponse.json(
                { error: 'Free limit reached. Upgrade to Pro for unlimited processing.' },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { podcastId } = schema.parse(body)

        // Verify podcast belongs to user
        const podcast = await db.podcast.findFirst({
            where: { id: podcastId, userId: user.id },
        })
        if (!podcast) return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
        if (podcast.status === 'PROCESSING') {
            return NextResponse.json({ error: 'Already processing' }, { status: 409 })
        }

        // Mark as processing
        await db.podcast.update({
            where: { id: podcastId },
            data: { status: 'PROCESSING' },
        })

        // Increment usage for free users
        if (user.plan === 'FREE') {
            await db.user.update({
                where: { id: user.id },
                data: { podcastsUsed: { increment: 1 } },
            })
        }

        // Run pipeline async (don't await — respond immediately)
        runPipeline(podcast.fileUrl, podcastId).catch(async (err) => {
            console.error('Pipeline error:', err)
            await db.podcast.update({
                where: { id: podcastId },
                data: { status: 'FAILED' },
            })
        })

        return NextResponse.json({ success: true, message: 'Processing started' })
    } catch (error) {
        console.error('Process error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function runPipeline(fileUrl: string, podcastId: string) {
    // 1. Download audio to temp file
    const response = await fetch(fileUrl)
    const buffer = await response.arrayBuffer()
    const tempPath = join(tmpdir(), `podcast-${podcastId}.mp3`)
    await writeFile(tempPath, Buffer.from(buffer))

    try {
        // 2. Transcribe with Whisper
        const { text, segments, duration } = await transcribeAudio(tempPath)

        await db.podcast.update({
            where: { id: podcastId },
            data: { transcript: text, durationSecs: Math.round(duration) },
        })

        // 3. Detect best clips with GPT-4o mini
        const clips = await detectBestClips(segments)

        // 4. Save clips to database
        await db.clip.createMany({
            data: clips.map((clip) => ({
                podcastId,
                startSec: clip.startSec,
                endSec: clip.endSec,
                transcript: clip.transcript,
                hook: clip.hook,
                reason: clip.reason,
                style: 'VERTICAL' as const,
            })),
        })

        // 5. Mark as done
        await db.podcast.update({
            where: { id: podcastId },
            data: { status: 'DONE' },
        })
    } finally {
        // Cleanup temp file
        await unlink(tempPath).catch(() => { })
    }
}
