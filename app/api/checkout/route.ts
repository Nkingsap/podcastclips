import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        if (user.plan === 'PRO') {
            return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
        }

        const session = await createCheckoutSession(user.id, user.email)
        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
