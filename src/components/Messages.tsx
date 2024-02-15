import { cn } from '@/lib/utils'
import { Message } from 'ai/react'
import { Loader2 } from 'lucide-react'


type Props = {
  messages: Message[]
  isPending: boolean
}

export default function Messages({ messages, isPending }: Props) {

  if (isPending) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin"/>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      { messages.map((msg, index) => (
        <div
          key={ index }
          className={ cn('flex', {
            'justify-end': msg.role === 'user',
            'justify-start': msg.role === 'assistant',
          }) }
        >
          <div
            className={
              cn('text-sm rounded-2xl px-4 py-2 shadow-md ring-1 ring-gray-900/10', {
                'bg-blue-600 text-white': msg.role === 'user',
              })
            }
          >
            { msg.content }
          </div>
        </div>
      )) }
    </div>
  )
}