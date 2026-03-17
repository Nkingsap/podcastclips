import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function getCurrentUser() {
    const { userId } = await auth()
    if (!userId) return null

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
    })

    return user
}

export async function getOrCreateUser() {
    const { userId } = await auth()
    if (!userId) return null

    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const existingUser = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
    })

    if (existingUser) return existingUser

    // Create user if doesn't exist (first login)
    const newUser = await db.user.create({
        data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
            name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
        },
        include: { subscription: true },
    })

    return newUser
}

export function isPro(user: { plan: string } | null) {
    return user?.plan === 'PRO'
}

export function canProcessPodcast(user: { plan: string; podcastsUsed: number } | null) {
    if (!user) return false
    if (isPro(user)) return true
    return user.podcastsUsed < parseInt(process.env.FREE_PODCAST_LIMIT ?? '2')
}
