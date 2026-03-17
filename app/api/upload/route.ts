import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await req.formData()
        const file = formData.get('file') as File
        const title = formData.get('title') as string

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        // Validate file type
        const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Upload MP3, MP4, WAV or OGG.' }, { status: 400 })
        }

        // Max 500MB
        const maxSize = 500 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Max 500MB.' }, { status: 400 })
        }

        // Upload to Supabase Storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('podcasts')
            .upload(fileName, buffer, { contentType: file.type })

        if (uploadError) {
            console.error('Supabase upload error:', uploadError)
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from('podcasts').getPublicUrl(fileName)

        // Save to database
        const podcast = await db.podcast.create({
            data: {
                userId: user.id,
                title: title || file.name,
                fileName: file.name,
                fileUrl: publicUrl,
                status: 'PENDING',
            },
        })

        return NextResponse.json({ podcast })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
