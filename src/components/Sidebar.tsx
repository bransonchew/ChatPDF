'use client'

import { Chat } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { MessageCircle, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'


type Props = {
  chats: Chat[]
  chatId: string
  isPro: boolean
}

export default function Sidebar({ chats, chatId }: Props) {
  return (
    <div className="w-full max-h-screen p-4 text-gray-200 bg-gray-900 overflow-scroll">

      {/*New Chat*/ }
      <Link href="/">
        <Button className="w-full border border-dashed border-white">
          <PlusCircle className="mr-2 w-4 h-4"/>
          New Chat
        </Button>
      </Link>

      {/*Chats*/ }
      <div className="flex flex-col gap-2 mt-4 h-screen pb-20 overflow-scroll">
        { chats.map((chat) => (
          <Link key={ chat.id } href={ `/chat/${ chat.id }` }>
            <div
              className={ cn('rounded-lg p-3 text-slate-300 flex items-center', {
                'bg-blue-600 text-white': chat.id === chatId,
                'hover:text-white': chat.id !== chatId,
              }) }
            >
              <MessageCircle className="mr-2"/>
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                { chat.name.replace('.pdf', '') }
              </p>
            </div>
          </Link>
        )) }
      </div>

      {/*Footer*/ }
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
        </div>
      </div>

    </div>
  )
}