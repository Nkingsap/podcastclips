import OpenAI from 'openai'
import { toFile } from 'openai'
import fs from 'fs'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export interface TranscriptSegment {
    id: number
    start: number
    end: number
    text: string
}

export interface TranscriptResult {
    text: string
    segments: TranscriptSegment[]
    duration: number
}

export async function transcribeAudio(filePath: string): Promise<TranscriptResult> {
    const audioFile = await toFile(fs.createReadStream(filePath), 'audio.mp3', {
        type: 'audio/mpeg',
    })

    const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
    })

    const segments = (response.segments ?? []).map((s: any, i: number) => ({
        id: i,
        start: s.start,
        end: s.end,
        text: s.text.trim(),
    }))

    const duration = segments[segments.length - 1]?.end ?? 0

    return {
        text: response.text,
        segments,
        duration,
    }
}

export interface DetectedClip {
    startSec: number
    endSec: number
    transcript: string
    hook: string
    reason: string
}

export async function detectBestClips(
    segments: TranscriptSegment[]
): Promise<DetectedClip[]> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a expert podcast clip curator. Identify the 5 best moments for 
        viral short-form video (TikTok, Reels, Shorts). Each clip should be 30–90 seconds.
        Prefer: strong opinions, surprising facts, emotional stories, actionable advice, 
        moments of tension or revelation.`,
            },
            {
                role: 'user',
                content: `Analyze this podcast transcript and return exactly 5 viral clip moments.
        
        Return a valid JSON object: 
        { "clips": [{ "startSec": number, "endSec": number, "transcript": string, "hook": string, "reason": string }] }
        
        - hook: a 1-sentence catchy caption for the clip
        - reason: why this moment is viral-worthy
        - transcript: the exact words spoken in the clip
        
        Transcript segments: ${JSON.stringify(segments.slice(0, 200))}`,
            },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('No response from GPT')

    const parsed = JSON.parse(content)
    return parsed.clips as DetectedClip[]
}
