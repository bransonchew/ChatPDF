'use server'

import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { auth } from '@clerk/nextjs'
import crypto from 'crypto'
import { and, eq } from 'drizzle-orm'


// See https://next-safe-action.dev/

const client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const acceptedTypes = ['application/pdf']

const maxSize = 10 * 1024 * 1024

const generateFileKey = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

type GetSignedURLParams = {
  fileType: string
  fileSize: number
  checksum: string
}

type SignedURLResponse = Promise<
  | { failure?: undefined, success: { url: string, fileKey: string } }
  | { failure: string, success?: undefined }
>

export async function getSignedURL({
  fileType,
  fileSize,
  checksum,
}: GetSignedURLParams): SignedURLResponse {

  const { userId } = auth()

  if (!userId) {
    return { failure: 'Unauthenticated' }
  }

  if (!acceptedTypes.includes(fileType)) {
    return { failure: 'Invalid file type' }
  }

  if (fileSize > maxSize) {
    return { failure: 'File size exceeds 10MB limit' }
  }

  const fileKey = generateFileKey()

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
    Metadata: { userId },
  })

  const url = await getSignedUrl(client, command, {
    expiresIn: 60,
  })

  return { success: { url, fileKey } }
}

export async function deleteChat(chatId: string, fileKey: string) {
  try {
    const { userId } = auth()

    if (!userId) {
      return { failure: 'Unauthenticated' }
    }

    // Delete database record
    await db.delete(chats).where(
      and(
        eq(chats.userId, userId!),
        eq(chats.id, chatId),
      ),
    )

    // Delete file from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    })

    await client.send(command)
  } catch (e) {
    console.error(e)
  }
}
