import { getContext } from '@/lib/context'
import { db } from '@/lib/db'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Message } from 'ai/react'
import OpenAI from 'openai'
import { messages as _messages } from '@/lib/db/schema'


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const { messages, chatId, fileKey } = await req.json()

    // Generate context prompt
    const query = messages[messages.length - 1].content
    const context = await getContext(query, fileKey)
    const prompt = {
      role: 'system',
      content: `
        AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        AI assistant is a big fan of Pinecone and Vercel.
        START CONTEXT BLOCK
        ${ context }
        END OF CONTEXT BLOCK
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.
      `,
    }

    // Request the OpenAI API for the response based on the prompt
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL!,
      stream: true,
      messages: [
        prompt,
        ...messages.filter((msg: Message) => msg.role === 'user'),
      ],
    })

    // Convert the response into a friendly text-stream
    // @ts-ignore
    const stream = OpenAIStream(response, {
      // Save user query message to db
      onStart: async () => {
        await db.insert(_messages).values({
          chatId: chatId,
          role: 'user',
          content: query,
        })
      },
      // Save ai response message to db
      onCompletion: async completion => {
        await db.insert(_messages).values({
          chatId: chatId,
          role: 'system',
          content: completion,
        })
      },
    })

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (e) {
    throw e
  }
}