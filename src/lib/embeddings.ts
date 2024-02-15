import { OpenAIEmbeddings } from '@langchain/openai'


const model = new OpenAIEmbeddings({
  // In Node.js defaults to process.env.OPENAI_API_KEY
  openAIApiKey: process.env.OPENAI_API_KEY,
})

export async function getEmbedding(text: string) {
  try {
    return await model.embedQuery(text)
  } catch (e) {
    console.error('Error embedding document', e)
    throw e
  }
}
