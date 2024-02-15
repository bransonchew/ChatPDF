import { db } from '@/lib/db'
import { userSubscriptions } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
import { auth, currentUser } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'


const baseUrl = process.env.BASE_URL + '/'

export async function GET() {
  try {
    const { userId } = auth()
    const user = await currentUser()

    if (!userId) {
      return new Response('unauthorized', { status: 401 })
    }

    const _userSubscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))

    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      // Trying to cancel at the billing portal
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId,
        return_url: baseUrl,
      })
      return Response.json({ url: stripeSession.url })
    }

    // User's first subscription
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: baseUrl,
      cancel_url: baseUrl,
      payment_method_types: [
        'card',
      ],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user?.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'ChatPDF Pro',
              description: 'Unlimited PDF sessions',
            },
            unit_amount: 2000,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    })

    return Response.json({ url: stripeSession.url })
  } catch (e) {
    console.error('Stripe error', e)
    return new Response('internal server error', { status: 500  })
  }
}