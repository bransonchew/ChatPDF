'use client'

import Messages from '@/components/Messages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { Message, useChat } from 'ai/react'
import axios from 'axios'
import { Send } from 'lucide-react'
import { useEffect } from 'react'


type Props = {
  chatId: string
  fileKey: string
}

export default function Chat({ chatId, fileKey }: Props) {

  const { data, isPending } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const res = await axios.post<Message[]>('/api/messages/', { chatId })
      return res.data
    },
  })

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: { chatId, fileKey },
    initialMessages: data || [],
  })

  useEffect(() => {
    const container = document.getElementById('message-container')
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/*Header*/ }
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/*Messages*/ }
      <Messages messages={ messages } isPending={ isPending }/>

      {/*Prompt*/ }
      <form
        onSubmit={ handleSubmit }
        className="flex sticky top-0 inset-x-0 p-2 bg-white h-fit mt-1"
      >
        <Input
          value={ input }
          onChange={ handleInputChange }
          placeholder="Ask me anything..."
          className="w-full"
        />
        <Button type="submit" className="bg-blue-600 ml-2">
          <Send className="h-4 w-4"/>
        </Button>
      </form>

    </div>
  )
}