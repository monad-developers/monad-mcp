import { Background } from '@/components/background'
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Monad Developer MCP - AI-Powered Development Tools',
  description:
    'Set up Monad Developer MCP in your IDE to access real-time documentation, query accounts, analyze transactions, and generate CPI statements. Built for the Monad developer community',
  keywords: [
    'Monad',
    'blockchain development',
    'MCP',
    'developer tools',
    'smart contracts',
    'web3',
  ],
  openGraph: {
    title: 'Monad Developer MCP - AI-Powered Development Tools',
    description:
      'Access Monad blockchain development tools directly in your IDE with real-time documentation and program analysis capabilities.',
    type: 'website',
    url: 'https://monad-mcp-tau.vercel.app',
    siteName: 'Monad Developer MCP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monad Developer MCP',
    description: 'AI-powered development tools for Monad blockchain developers',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black">
        <Background>{children}</Background>
      </body>
    </html>
  )
}
