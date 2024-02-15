'use client'


type Props = {
  url: string
}

export default function PDFViewer({ url }: Props) {
  return (
    <>
      <iframe
        src={ `https://docs.google.com/gview?url=${ url }&embedded=true` }
        className="w-full h-full"
      />
    </>
  )
}