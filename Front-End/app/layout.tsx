import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPARCS Community',
  description: 'SPARCS 신입생 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
