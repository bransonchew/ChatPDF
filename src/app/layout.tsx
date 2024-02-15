import Providers from '@/components/Providers'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import { Toaster } from 'react-hot-toast'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatPDF',
}

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en">
        <body className={ inter.className }>
        { children }
        <Toaster/>
        <Analytics/>
        <SpeedInsights/>
        </body>
        </html>
      </Providers>
    </ClerkProvider>
  )
}
