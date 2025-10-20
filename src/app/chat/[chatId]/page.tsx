import Chat from '@/components/Chat'
import PDFViewer from '@/components/PDFViewer'
import Sidebar from '@/components/Sidebar'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { checkSubscription } from '@/lib/subscription'
import { auth } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'


type Params = Promise<{ chatId: string }>

export default async function Page({ params }: { params: Params }) {

  const { userId } = auth()

  const _chats = await db.select().from(chats).where(
    and(
      eq(chats.userId, userId!),
    ),
  )

  // Current chat
  const { chatId } = await params
  const chat = _chats.find(chat => chat.id === chatId)

  if (!chat) {
    redirect('/')
  }

  const isPro = await checkSubscription()

  return (
    <div className="flex h-screen overflow-scroll">
      <div className="flex w-full h-screen overflow-scroll">
        {/* Sidebar */ }
        <div className="flex-[1] max-w-xs">
          <Sidebar chats={ _chats } chatId={ chat.id } isPro={ isPro }/>
        </div>

        {/* PDF viewer */ }
        <div className="flex-[5] max-h-screen p-4 overflow-scroll">
          <PDFViewer url={ chat.fileUrl }/>
        </div>

        {/* Chat */ }
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <Chat chatId={ chat.id } fileKey={ chat.fileKey }/>
        </div>
      </div>
    </div>
  )
}