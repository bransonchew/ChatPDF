'use client'

import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useState } from 'react'


type Props = {
  isPro: boolean
}

export default function SubscribeButton({ isPro }: Props) {

  const [loading, setLoading] = useState(false)

  const handleSubscription = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/stripe')
      window.location.href = res.data.url
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button disabled={ loading } onClick={ handleSubscription }>
      { isPro ? 'Manage Subscriptions' : 'Upgrade to Pro'}
    </Button>
  )
}