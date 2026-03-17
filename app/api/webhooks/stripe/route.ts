import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object as any
                const userId = sub.metadata?.userId
                if (!userId) break

                await db.subscription.upsert({
                    where: { stripeSubId: sub.id },
                    create: {
                        userId,
                        stripeCustomerId: sub.customer,
                        stripePriceId: sub.items.data[0].price.id,
                        stripeSubId: sub.id,
                        status: sub.status,
                        currentPeriodEnd: new Date(sub.current_period_end * 1000),
                    },
                    update: {
                        status: sub.status,
                        currentPeriodEnd: new Date(sub.current_period_end * 1000),
                        stripePriceId: sub.items.data[0].price.id,
                    },
                })

                // Update user plan
                await db.user.update({
                    where: { id: userId },
                    data: {
                        plan: sub.status === 'active' ? 'PRO' : 'FREE',
                    },
                })
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as any
                const userId = sub.metadata?.userId
                if (!userId) break

                await db.subscription.update({
                    where: { stripeSubId: sub.id },
                    data: { status: 'canceled' },
                })

                await db.user.update({
                    where: { id: userId },
                    data: { plan: 'FREE' },
                })
                break
            }

            default:
                console.log(`Unhandled event: ${event.type}`)
        }
    } catch (err) {
        console.error('Webhook handler error:', err)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
