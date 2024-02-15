import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { loadVectors } from '@/lib/pinecone'
import { auth } from '@clerk/nextjs'


export async function POST(req: Request) {

  const { userId } = auth()

  if (!userId) {
    return Response.json(
      { error: 'unauthorized' },
      { status: 401 },
    )
  }

  try {
    const { fileKey, fileName, fileUrl } = await req.json()

    await loadVectors(fileKey)

    const chatId = await db.insert(chats).values({
      name: fileName,
      userId,
      fileUrl,
      fileKey,
    }).returning({
      insertedId: chats.id,
    })

    return Response.json(
      { chatId: chatId[0].insertedId },
      { status: 200 },
    )
  } catch (e) {
    console.error(e)
    return Response.json(
      { error: 'internal server error' },
      { status: 500 },
    )
  }
}
