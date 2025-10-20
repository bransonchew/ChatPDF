import { downloadFile } from '@/lib/aws'
import { getEmbedding } from '@/lib/embeddings'
import { convertToAscii } from '@/lib/utils'
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import { Document } from 'langchain/document'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import md5 from 'md5'


type PDFPage = {
  pageContent: string,
  metadata: {
    loc: { pageNumber: number }
  }
}

export async function loadVectors(key: string) {

  console.log('Downloading file from S3...')

  // 1. Download the pdf
  const path = await downloadFile(key)

  if (!path) {
    return new Error('PDF file could not be downloaded')
  }

  console.log(`Loading file at ${ path } into memory...`)

  // 2. Load the pdf
  const loader = new PDFLoader(path)
  const pages = await loader.load() as PDFPage[]

  pages.forEach(page => console.log(page))

  // 3. Split and segment the pdf
  const docs = await splitDocuments(pages)

  console.log('Embedding documents...')

  // 4. Vectorize and embed individual documents
  const vectors = await embedDocuments(docs)

  console.log('Inserting vectors into pinecone...')

  // 5. Upload to pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  })
  const index = pinecone.index('chatpdf')
  const ns = index.namespace(convertToAscii(key))

  await ns.upsert(vectors)
}

async function splitDocuments(docs: Document[]) {
  const splitter = new RecursiveCharacterTextSplitter()
  return await splitter.splitDocuments(docs.map(
    ({ pageContent, metadata }) => new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ))
}

async function embedDocuments(docs: Document[]) {
  return await Promise.all(docs.map(
    async ({ pageContent, metadata }) => {
      return {
        id: md5(pageContent),
        values: await getEmbedding(pageContent),
        metadata: {
          pageNumber: metadata.pageNumber,
          text: metadata.text,
        },
      } as PineconeRecord
    },
  ))
}

function truncateStringByBytes(str: string, bytes: number) {
  const enc = new TextEncoder()
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}