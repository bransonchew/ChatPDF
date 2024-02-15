'use client'

import { getSignedURL } from '@/lib/actions'
import { computeSHA256 } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Inbox, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'


export default function FileUpload() {

  const [uploading, setUploading] = useState(false)

  const router = useRouter()

  type UploadResult =
    | { failure: string, success?: undefined }
    | { failure?: undefined, success: { fileKey: string, fileUrl: string } }

  const upload = async (file: File): Promise<UploadResult> => {

    const signedURLResult = await getSignedURL({
      fileType: file.type,
      fileSize: file.size,
      checksum: await computeSHA256(file),
    })

    if (signedURLResult.failure !== undefined) {
      return { failure: signedURLResult.failure }
    }

    const { url, fileKey } = signedURLResult.success

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!res.ok) {
      return { failure: 'Error uploading file' }
    }

    return { success: { fileKey, fileUrl: url.split('?')[0] } }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ fileKey, fileName, fileUrl }: {
      fileKey: string
      fileName: string
      fileUrl: string,
    }) => {
      const response = await axios.post('api/create-chat', {
        fileKey,
        fileName,
        fileUrl,
      })
      return response.data
    },
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropAccepted: async acceptedFiles => {

      setUploading(true)
      const file = acceptedFiles[0]

      // Upload file and create chat
      try {
        const result = await upload(file)

        if (result.failure !== undefined) {
          toast.error(result.failure)
          return
        }

        const { fileKey, fileUrl } = result.success

        mutate({ fileKey, fileName: file.name, fileUrl }, {
          onSuccess: ({ chatId }) => {
            toast.success('File uploaded successfully!')
            router.push(`/chat/${ chatId }`)
          },
          onError: err => {
            toast.error('Error creating chat')
            console.error(err)
          },
        })
      } catch (e) {
        console.error(e)
      } finally {
        setUploading(false)
      }
    },
    onDropRejected: (fileRejections) => {

      fileRejections[0].errors.forEach(err => {
        if (err.code === 'file-invalid-type') {
          toast.error('File must be a PDF document!')
        } else if (err.code === 'file-too-large') {
          toast.error('File exceeds 10MB limit!')
        }
      })

      console.error(fileRejections[0].errors)
    },
  })

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        { ...getRootProps({
          className:
            'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 ' +
            'flex justify-center items-center flex-col',
        }) }
      >
        <input { ...getInputProps() }/>
        { uploading || isPending ?
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin"/>
            <p className="mt-2 text sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
          :
          <>
            <Inbox className="w-10 h-10 text-blue-500"/>
            <p className="mt-2 text-sm text-slate-400">
              Drop your PDF here
            </p>
          </>
        }
      </div>
    </div>
  )
}