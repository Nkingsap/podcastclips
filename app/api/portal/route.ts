import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { createCustomerPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        if (!user.subscription?.stripeCustomerId) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
        }

        const session = await createCustomerPortalSession(user.subscription.stripeCustomerId)
        return NextResponse.redirect(session.url)
    } catch (error) {
        console.error('Portal error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
