'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped) setFile(dropped)
    }, [])

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setError('')

        try {
            // 1. Upload file
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title || file.name)

            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
            const uploadData = await uploadRes.json()

            if (!uploadRes.ok) throw new Error(uploadData.error)

            // 2. Trigger AI processing
            const processRes = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ podcastId: uploadData.podcast.id }),
            })
            const processData = await processRes.json()

            if (!processRes.ok) throw new Error(processData.error)

            // 3. Go to dashboard to see progress
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-6 py-16">
                <a href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors">
                    ← Back to dashboard
                </a>

                <h1 className="text-3xl font-bold mb-2">Upload a podcast</h1>
                <p className="text-gray-400 mb-10">
                    Upload an audio file. Our AI will find the 5 best moments and generate viral clips.
                </p>

                {/* Title input */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Episode title (optional)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Future of AI with John Doe"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                {/* Drop zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${dragging ? 'border-purple-500 bg-purple-950/30' : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'}`}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="text-4xl mb-4">🎙️</div>
                    {file ? (
                        <div>
                            <p className="font-medium text-white">{file.name}</p>
                            <p className="text-sm text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium text-gray-300 mb-1">Drop your audio file here</p>
                            <p className="text-sm text-gray-500">MP3, MP4, WAV, OGG · Max 500MB</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="mt-6 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                    {uploading ? '⏳ Processing...' : '✨ Generate viral clips'}
                </button>

                <p className="text-center text-xs text-gray-600 mt-4">
                    Processing takes 1–3 minutes depending on episode length
                </p>
            </div>
        </div>
    )
}
