import { getEmbedding } from '@/lib/embeddings'
import { convertToAscii } from '@/lib/utils'
import { Pinecone } from '@pinecone-database/pinecone'


const THRESHOLD = 0.7

const MAX_CHARACTER_LIMIT = 3000

export async function getMatches(vector: number[], fileKey: string) {

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  })
  const index = pinecone.index('chatpdf')
  const ns = index.namespace(convertToAscii(fileKey))

  try {
    const queryResponse = await ns.query({
      vector,
      topK: 5,
      includeValues: true,
      includeMetadata: true,
    })
    return queryResponse.matches
  } catch (e) {
    console.error('Error querying embeddings', e)
    throw e
  }
}

type Metadata = {
  pageNumber: number,
  text: string
}

export async function getContext(query: string, fileKey: string) {

  const embeddings = await getEmbedding(query)
  const matches = await getMatches(embeddings, fileKey)

  // Remove docs that scored lower
  const qualifiedDocs = matches.filter(doc => doc.score && doc.score > THRESHOLD)

  return qualifiedDocs
    .map(doc => (doc.metadata as Metadata).text)
    .join('\n')
    .substring(0, MAX_CHARACTER_LIMIT)
}