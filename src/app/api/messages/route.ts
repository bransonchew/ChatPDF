import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'


export const runtime = 'edge'

export async function POST(req: Request) {

  const { chatId } = await req.json()

  return Response.json(
    await db.select().from(messages).where(eq(messages.chatId, chatId)),
  )
}