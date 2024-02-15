import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'


const client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function downloadFile(key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await client.send(new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      }))

      const path = `/tmp/${ Date.now() }.pdf`

      if (res.Body instanceof require('stream').Readable) {
        // AWS-SDK v3 has some issues with their typescript definitions, but this works
        // https://github.com/aws/aws-sdk-js-v3/issues/843
        // open the writable stream and write the file
        const ws = fs.createWriteStream(path)

        ws.on('open', fd => {
          // @ts-ignore
          res.Body?.pipe(ws).on('finish', () => resolve(path))
        })
        // obj.Body?.pipe(fs.createWriteStream(file_name));
      }
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}