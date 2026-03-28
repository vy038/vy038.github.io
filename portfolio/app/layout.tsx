import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Victor Yu',
  description: 'Firmware & Embedded Systems Engineer — Computer Engineering @ University of Waterloo',
  openGraph: {
    title: 'Victor Yu',
    description: 'Firmware & Embedded Systems Engineer',
    type: 'website',
    images: [{ url: '/preview.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/preview.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
        {/* Runs before any bundle — prevents browser scroll restoration from briefly showing off-screen content */}
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';window.scrollTo(0,0);" }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
