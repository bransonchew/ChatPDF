import { db } from '@/lib/db'
import { userSubscriptions } from '@/lib/db/schema'
import { auth } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'


const DAY_IN_MS = 24 * 60 * 60 * 1000

export async function checkSubscription() {

  const { userId } = auth()

  if (!userId) {
    return false
  }

  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))

  if (!_userSubscriptions.length) {
    return false
  }

  const userSubscription = _userSubscriptions[0]

  return Boolean(
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
    Date.now()
  )
}