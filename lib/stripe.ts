import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
})

export async function createCheckoutSession(userId: string, userEmail: string) {
    // Create or fetch Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 })
    let customerId = customers.data[0]?.id

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: userEmail,
            metadata: { userId },
        })
        customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: process.env.STRIPE_PRO_PRICE_ID!,
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: { userId },
        subscription_data: {
            metadata: { userId },
        },
    })

    return session
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
    const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })
    return session
}
