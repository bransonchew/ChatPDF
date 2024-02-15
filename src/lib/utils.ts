import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToAscii(input: string) {
  // remove non ascii characters
  return input.replace(/[^\x00-\x7F]+/g, '')
}

export async function computeSHA256(file: File) {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}